// @ts-nocheck comment
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { Op, Transaction } from 'sequelize';

import config from '../config/configSetup';
import logger from '../services/logger';
import { sequelize } from './db';
import { getPromoSubscriptionStatus } from './index';
import { getDistanceFromLatLonInKm, successResponse, errorResponse } from '../helpers/utility';
import { sendToken } from '../services/notification';
import { LanLog, UserType } from '../models/LanLog';
import { Profile } from '../models/Profile';
import { Notification, NotificationType } from '../models/Notification';
import { Users } from '../models/Users';
import { Beacon, BeaconStatus } from '../models/Beacon';
import { BeaconParticipant } from '../models/BeaconParticipant';

const stripe = new Stripe(config.STRIPE_SK, { apiVersion: '2023-08-16' });

/** Haversine-based radius check — 10 miles */
const RADIUS_MILES = 10;
/** Beacon lifetime: 4 hours */
const BEACON_TTL_MS = 4 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Internal helper — notify all online vendors within RADIUS_MILES
// ---------------------------------------------------------------------------
const _notifyNearbyVendors = async (beacon: Beacon): Promise<void> => {
  try {
    const allOnline = await LanLog.findAll({ where: { online: true, type: UserType.VENDOR } });
    const nearby = allOnline.filter((v) =>
      getDistanceFromLatLonInKm(
        Number(v.Lan),
        Number(v.Log),
        beacon.lan,
        beacon.log,
      ) <= RADIUS_MILES,
    );

    for (const v of nearby) {
      const title  = 'Hunger Beacon Alert!';
      const desc   = `${beacon.currentCount} people are hungry at ${beacon.locationName || 'a nearby location'}!`;
      sendToken(v.userId, title, desc, 'HUNGER_BEACON_ACTIVE');
      await Notification.create({
        userId: v.userId,
        title,
        description: desc,
        type: NotificationType.NORMAL,
      });
    }
  } catch (err: any) {
    logger.error('_notifyNearbyVendors error:', err?.message || err);
  }
};

// ---------------------------------------------------------------------------
// Internal helper — check subscription (vendor gate for claimBeacon)
// ---------------------------------------------------------------------------
const _checkVendorSubscription = async (
  userId: number,
  res: Response,
): Promise<boolean> => {
  const profile = await Profile.findOne({ where: { userId }, include: [{ model: Users }] });
  if (!profile?.user) {
    errorResponse(res, 'Vendor profile not found');
    return false;
  }

  const subId = profile.user.subscription_id;

  if (subId?.startsWith?.('PROMO_')) {
    const promoStatus = await getPromoSubscriptionStatus(profile.id, subId);
    if (!promoStatus?.active) {
      res.status(403).json({ status: false, message: 'An active subscription is required to claim a Hunger Beacon.' });
      return false;
    }
  } else if (subId) {
    try {
      const sub = await stripe.subscriptions.retrieve(subId);
      if (sub.status !== 'active' && sub.status !== 'trialing') {
        res.status(403).json({ status: false, message: 'An active subscription is required to claim a Hunger Beacon.' });
        return false;
      }
    } catch (_) {
      res.status(403).json({ status: false, message: 'An active subscription is required to claim a Hunger Beacon.' });
      return false;
    }
  } else {
    res.status(403).json({ status: false, message: 'An active subscription is required to claim a Hunger Beacon.' });
    return false;
  }

  return true;
};

// ---------------------------------------------------------------------------
// POST /beacon — create a new beacon at the caller's coordinates
// ---------------------------------------------------------------------------
export const createBeacon = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const { lan, log, locationName, threshold } = req.body;

    if (!lan || !log) {
      return errorResponse(res, 'lan and log are required');
    }

    const expiresAt = new Date(Date.now() + BEACON_TTL_MS);

    const beacon = await Beacon.create({
      lan: Number(lan),
      log: Number(log),
      locationName: locationName || null,
      threshold: threshold ? Number(threshold) : 25,
      currentCount: 1,
      status: BeaconStatus.PENDING,
      creatorId: id,
      expiresAt,
    });

    await BeaconParticipant.create({ beaconId: beacon.id, userId: id });

    logger.info('createBeacon', { beaconId: beacon.id, userId: id });
    return successResponse(res, 'Beacon created', beacon);
  } catch (err: any) {
    logger.error('createBeacon error:', err?.message || err);
    return errorResponse(res, 'Failed to create beacon');
  }
};

// ---------------------------------------------------------------------------
// POST /beacon/join — join an existing beacon
// ---------------------------------------------------------------------------
export const joinBeacon = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const { beaconId } = req.body;

    if (!beaconId) {
      return errorResponse(res, 'beaconId is required');
    }

    const beacon = await Beacon.findByPk(beaconId);
    if (!beacon) {
      return errorResponse(res, 'Beacon not found');
    }
    if (beacon.status === BeaconStatus.EXPIRED || beacon.status === BeaconStatus.CLAIMED) {
      return errorResponse(res, 'This beacon is no longer active');
    }
    if (new Date() > beacon.expiresAt) {
      await beacon.update({ status: BeaconStatus.EXPIRED });
      return errorResponse(res, 'This beacon has expired');
    }

    const [, created] = await BeaconParticipant.findOrCreate({
      where: { beaconId, userId: id },
      defaults: { beaconId, userId: id },
    });

    if (created) {
      await beacon.increment('currentCount');
      await beacon.reload();

      if (beacon.currentCount >= beacon.threshold && beacon.status === BeaconStatus.PENDING) {
        await beacon.update({ status: BeaconStatus.ACTIVE });
        await _notifyNearbyVendors(beacon);
      }
    }

    await beacon.reload();
    return successResponse(res, created ? 'Joined beacon' : 'Already joined', beacon);
  } catch (err: any) {
    logger.error('joinBeacon error:', err?.message || err);
    return errorResponse(res, 'Failed to join beacon');
  }
};

// ---------------------------------------------------------------------------
// GET /beacon?lan=&log= — return non-expired beacons within RADIUS_MILES
// ---------------------------------------------------------------------------
export const getNearbyBeacons = async (req: Request, res: Response) => {
  try {
    const { lan, log } = req.query;
    if (!lan || !log) {
      return errorResponse(res, 'lan and log are required');
    }

    const userLan = Number(lan);
    const userLog = Number(log);
    const now     = new Date();

    // Lazy-expire stale beacons
    await Beacon.update(
      { status: BeaconStatus.EXPIRED },
      {
        where: {
          expiresAt: { [Op.lt]: now },
          status: { [Op.notIn]: [BeaconStatus.EXPIRED, BeaconStatus.CLAIMED] },
        },
      },
    );

    const beacons = await Beacon.findAll({
      where: {
        status: { [Op.notIn]: [BeaconStatus.EXPIRED, BeaconStatus.CLAIMED] },
        expiresAt: { [Op.gt]: now },
      },
      include: [{ model: BeaconParticipant }],
    });

    const nearby = beacons.filter((b) =>
      getDistanceFromLatLonInKm(userLan, userLog, b.lan, b.log) <= RADIUS_MILES,
    );

    return successResponse(res, 'Nearby beacons', nearby);
  } catch (err: any) {
    logger.error('getNearbyBeacons error:', err?.message || err);
    return errorResponse(res, 'Failed to fetch beacons');
  }
};

// ---------------------------------------------------------------------------
// POST /beacon/claim — vendor claims an ACTIVE beacon (subscription-gated)
// ---------------------------------------------------------------------------
export const claimBeacon = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const { beaconId } = req.body;

    if (!beaconId) {
      return errorResponse(res, 'beaconId is required');
    }

    // Subscription gate
    const allowed = await _checkVendorSubscription(id, res);
    if (!allowed) return;

    const vendorProfile = await Profile.findOne({ where: { userId: id } });

    await sequelize.transaction(async (t: Transaction) => {
      const beacon = await Beacon.findOne({
        where: { id: beaconId },
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!beacon) {
        return res.status(404).json({ status: false, message: 'Beacon not found' });
      }
      if (beacon.status !== BeaconStatus.ACTIVE) {
        return res.status(409).json({ status: false, message: 'This beacon has already been claimed or is not active' });
      }

      await beacon.update(
        {
          status: BeaconStatus.CLAIMED,
          claimedByUserId: id,
          vendorBusinessName: vendorProfile?.business_name || null,
        },
        { transaction: t },
      );

      // Notify all participants
      const participants = await BeaconParticipant.findAll({ where: { beaconId }, transaction: t });
      const vendorName   = vendorProfile?.business_name || 'A food truck';
      const title        = 'A truck is on the way!';
      const desc         = `${vendorName} is heading to ${beacon.locationName || 'your beacon location'}!`;

      for (const p of participants) {
        if (p.userId !== id) {
          sendToken(p.userId, title, desc, 'HUNGER_BEACON_CLAIMED');
          await Notification.create(
            { userId: p.userId, title, description: desc, type: NotificationType.NORMAL },
            { transaction: t },
          );
        }
      }

      return successResponse(res, 'Beacon claimed', beacon);
    });
  } catch (err: any) {
    logger.error('claimBeacon error:', err?.message || err);
    return errorResponse(res, 'Failed to claim beacon');
  }
};

// ---------------------------------------------------------------------------
// GET /beacon/vendor?lan=&log= — active beacons near vendor
// ---------------------------------------------------------------------------
export const getActiveBeaconsForVendor = async (req: Request, res: Response) => {
  try {
    const { lan, log } = req.query;
    if (!lan || !log) {
      return errorResponse(res, 'lan and log are required');
    }

    const vendorLan = Number(lan);
    const vendorLog = Number(log);
    const now       = new Date();

    const beacons = await Beacon.findAll({
      where: {
        status: BeaconStatus.ACTIVE,
        expiresAt: { [Op.gt]: now },
      },
    });

    const nearby = beacons
      .map((b) => ({
        ...b.toJSON(),
        distance: getDistanceFromLatLonInKm(vendorLan, vendorLog, b.lan, b.log),
      }))
      .filter((b) => b.distance <= RADIUS_MILES);

    return successResponse(res, 'Active beacons for vendor', nearby);
  } catch (err: any) {
    logger.error('getActiveBeaconsForVendor error:', err?.message || err);
    return errorResponse(res, 'Failed to fetch beacons');
  }
};

// ---------------------------------------------------------------------------
// GET /beacon/:id — fetch a single beacon by id (for polling)
// ---------------------------------------------------------------------------
export const getBeaconById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const beacon = await Beacon.findOne({
      where: { id },
      include: [{ model: BeaconParticipant }],
    });
    if (!beacon) {
      return errorResponse(res, 'Beacon not found');
    }
    return successResponse(res, 'Beacon', beacon);
  } catch (err: any) {
    logger.error('getBeaconById error:', err?.message || err);
    return errorResponse(res, 'Failed to fetch beacon');
  }
};
