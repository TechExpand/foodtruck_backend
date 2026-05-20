"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBeaconById = exports.getActiveBeaconsForVendor = exports.claimBeacon = exports.getNearbyBeacons = exports.joinBeacon = exports.createBeacon = void 0;
const stripe_1 = __importDefault(require("stripe"));
const sequelize_1 = require("sequelize");
const configSetup_1 = __importDefault(require("../config/configSetup"));
const logger_1 = __importDefault(require("../services/logger"));
const db_1 = require("./db");
const index_1 = require("./index");
const utility_1 = require("../helpers/utility");
const notification_1 = require("../services/notification");
const LanLog_1 = require("../models/LanLog");
const Profile_1 = require("../models/Profile");
const Notification_1 = require("../models/Notification");
const Users_1 = require("../models/Users");
const Beacon_1 = require("../models/Beacon");
const BeaconParticipant_1 = require("../models/BeaconParticipant");
const stripe = new stripe_1.default(configSetup_1.default.STRIPE_SK, { apiVersion: '2023-08-16' });
/** Haversine-based radius check — 10 miles */
const RADIUS_MILES = 10;
/** Beacon lifetime: 4 hours */
const BEACON_TTL_MS = 4 * 60 * 60 * 1000;
// ---------------------------------------------------------------------------
// Internal helper — notify all online vendors within RADIUS_MILES
// ---------------------------------------------------------------------------
const _notifyNearbyVendors = (beacon) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allOnline = yield LanLog_1.LanLog.findAll({ where: { online: true, type: LanLog_1.UserType.VENDOR } });
        const nearby = allOnline.filter((v) => (0, utility_1.getDistanceFromLatLonInKm)(Number(v.Lan), Number(v.Log), beacon.lan, beacon.log) <= RADIUS_MILES);
        for (const v of nearby) {
            const title = 'Hunger Beacon Alert!';
            const desc = `${beacon.currentCount} people are hungry at ${beacon.locationName || 'a nearby location'}!`;
            (0, notification_1.sendToken)(v.userId, title, desc, 'HUNGER_BEACON_ACTIVE');
            yield Notification_1.Notification.create({
                userId: v.userId,
                title,
                description: desc,
                type: Notification_1.NotificationType.NORMAL,
            });
        }
    }
    catch (err) {
        logger_1.default.error('_notifyNearbyVendors error:', (err === null || err === void 0 ? void 0 : err.message) || err);
    }
});
// ---------------------------------------------------------------------------
// Internal helper — check subscription (vendor gate for claimBeacon)
// ---------------------------------------------------------------------------
const _checkVendorSubscription = (userId, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const profile = yield Profile_1.Profile.findOne({ where: { userId }, include: [{ model: Users_1.Users }] });
    if (!(profile === null || profile === void 0 ? void 0 : profile.user)) {
        (0, utility_1.errorResponse)(res, 'Vendor profile not found');
        return false;
    }
    const subId = profile.user.subscription_id;
    if ((_a = subId === null || subId === void 0 ? void 0 : subId.startsWith) === null || _a === void 0 ? void 0 : _a.call(subId, 'PROMO_')) {
        const promoStatus = yield (0, index_1.getPromoSubscriptionStatus)(profile.id, subId);
        if (!(promoStatus === null || promoStatus === void 0 ? void 0 : promoStatus.active)) {
            res.status(403).json({ status: false, message: 'An active subscription is required to claim a Hunger Beacon.' });
            return false;
        }
    }
    else if (subId) {
        try {
            const sub = yield stripe.subscriptions.retrieve(subId);
            if (sub.status !== 'active' && sub.status !== 'trialing') {
                res.status(403).json({ status: false, message: 'An active subscription is required to claim a Hunger Beacon.' });
                return false;
            }
        }
        catch (_) {
            res.status(403).json({ status: false, message: 'An active subscription is required to claim a Hunger Beacon.' });
            return false;
        }
    }
    else {
        res.status(403).json({ status: false, message: 'An active subscription is required to claim a Hunger Beacon.' });
        return false;
    }
    return true;
});
// ---------------------------------------------------------------------------
// POST /beacon — create a new beacon at the caller's coordinates
// ---------------------------------------------------------------------------
const createBeacon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.user;
        const { lan, log, locationName, threshold } = req.body;
        if (!lan || !log) {
            return (0, utility_1.errorResponse)(res, 'lan and log are required');
        }
        const expiresAt = new Date(Date.now() + BEACON_TTL_MS);
        const beacon = yield Beacon_1.Beacon.create({
            lan: Number(lan),
            log: Number(log),
            locationName: locationName || null,
            threshold: threshold ? Number(threshold) : 25,
            currentCount: 1,
            status: Beacon_1.BeaconStatus.PENDING,
            creatorId: id,
            expiresAt,
        });
        yield BeaconParticipant_1.BeaconParticipant.create({ beaconId: beacon.id, userId: id });
        logger_1.default.info('createBeacon', { beaconId: beacon.id, userId: id });
        return (0, utility_1.successResponse)(res, 'Beacon created', beacon);
    }
    catch (err) {
        logger_1.default.error('createBeacon error:', (err === null || err === void 0 ? void 0 : err.message) || err);
        return (0, utility_1.errorResponse)(res, 'Failed to create beacon');
    }
});
exports.createBeacon = createBeacon;
// ---------------------------------------------------------------------------
// POST /beacon/join — join an existing beacon
// ---------------------------------------------------------------------------
const joinBeacon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.user;
        const { beaconId } = req.body;
        if (!beaconId) {
            return (0, utility_1.errorResponse)(res, 'beaconId is required');
        }
        const beacon = yield Beacon_1.Beacon.findByPk(beaconId);
        if (!beacon) {
            return (0, utility_1.errorResponse)(res, 'Beacon not found');
        }
        if (beacon.status === Beacon_1.BeaconStatus.EXPIRED || beacon.status === Beacon_1.BeaconStatus.CLAIMED) {
            return (0, utility_1.errorResponse)(res, 'This beacon is no longer active');
        }
        if (new Date() > beacon.expiresAt) {
            yield beacon.update({ status: Beacon_1.BeaconStatus.EXPIRED });
            return (0, utility_1.errorResponse)(res, 'This beacon has expired');
        }
        const [, created] = yield BeaconParticipant_1.BeaconParticipant.findOrCreate({
            where: { beaconId, userId: id },
            defaults: { beaconId, userId: id },
        });
        if (created) {
            yield beacon.increment('currentCount');
            yield beacon.reload();
            if (beacon.currentCount >= beacon.threshold && beacon.status === Beacon_1.BeaconStatus.PENDING) {
                yield beacon.update({ status: Beacon_1.BeaconStatus.ACTIVE });
                yield _notifyNearbyVendors(beacon);
            }
        }
        yield beacon.reload();
        return (0, utility_1.successResponse)(res, created ? 'Joined beacon' : 'Already joined', beacon);
    }
    catch (err) {
        logger_1.default.error('joinBeacon error:', (err === null || err === void 0 ? void 0 : err.message) || err);
        return (0, utility_1.errorResponse)(res, 'Failed to join beacon');
    }
});
exports.joinBeacon = joinBeacon;
// ---------------------------------------------------------------------------
// GET /beacon?lan=&log= — return non-expired beacons within RADIUS_MILES
// ---------------------------------------------------------------------------
const getNearbyBeacons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lan, log } = req.query;
        if (!lan || !log) {
            return (0, utility_1.errorResponse)(res, 'lan and log are required');
        }
        const userLan = Number(lan);
        const userLog = Number(log);
        const now = new Date();
        // Lazy-expire stale beacons
        yield Beacon_1.Beacon.update({ status: Beacon_1.BeaconStatus.EXPIRED }, {
            where: {
                expiresAt: { [sequelize_1.Op.lt]: now },
                status: { [sequelize_1.Op.notIn]: [Beacon_1.BeaconStatus.EXPIRED, Beacon_1.BeaconStatus.CLAIMED] },
            },
        });
        const beacons = yield Beacon_1.Beacon.findAll({
            where: {
                status: { [sequelize_1.Op.notIn]: [Beacon_1.BeaconStatus.EXPIRED, Beacon_1.BeaconStatus.CLAIMED] },
                expiresAt: { [sequelize_1.Op.gt]: now },
            },
            include: [{ model: BeaconParticipant_1.BeaconParticipant }],
        });
        const nearby = beacons.filter((b) => (0, utility_1.getDistanceFromLatLonInKm)(userLan, userLog, b.lan, b.log) <= RADIUS_MILES);
        return (0, utility_1.successResponse)(res, 'Nearby beacons', nearby);
    }
    catch (err) {
        logger_1.default.error('getNearbyBeacons error:', (err === null || err === void 0 ? void 0 : err.message) || err);
        return (0, utility_1.errorResponse)(res, 'Failed to fetch beacons');
    }
});
exports.getNearbyBeacons = getNearbyBeacons;
// ---------------------------------------------------------------------------
// POST /beacon/claim — vendor claims an ACTIVE beacon (subscription-gated)
// ---------------------------------------------------------------------------
const claimBeacon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.user;
        const { beaconId } = req.body;
        if (!beaconId) {
            return (0, utility_1.errorResponse)(res, 'beaconId is required');
        }
        // Subscription gate
        const allowed = yield _checkVendorSubscription(id, res);
        if (!allowed)
            return;
        const vendorProfile = yield Profile_1.Profile.findOne({ where: { userId: id } });
        yield db_1.sequelize.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            const beacon = yield Beacon_1.Beacon.findOne({
                where: { id: beaconId },
                lock: t.LOCK.UPDATE,
                transaction: t,
            });
            if (!beacon) {
                return res.status(404).json({ status: false, message: 'Beacon not found' });
            }
            if (beacon.status !== Beacon_1.BeaconStatus.ACTIVE) {
                return res.status(409).json({ status: false, message: 'This beacon has already been claimed or is not active' });
            }
            yield beacon.update({
                status: Beacon_1.BeaconStatus.CLAIMED,
                claimedByUserId: id,
                vendorBusinessName: (vendorProfile === null || vendorProfile === void 0 ? void 0 : vendorProfile.business_name) || null,
            }, { transaction: t });
            // Notify all participants
            const participants = yield BeaconParticipant_1.BeaconParticipant.findAll({ where: { beaconId }, transaction: t });
            const vendorName = (vendorProfile === null || vendorProfile === void 0 ? void 0 : vendorProfile.business_name) || 'A food truck';
            const title = 'A truck is on the way!';
            const desc = `${vendorName} is heading to ${beacon.locationName || 'your beacon location'}!`;
            for (const p of participants) {
                if (p.userId !== id) {
                    (0, notification_1.sendToken)(p.userId, title, desc, 'HUNGER_BEACON_CLAIMED');
                    yield Notification_1.Notification.create({ userId: p.userId, title, description: desc, type: Notification_1.NotificationType.NORMAL }, { transaction: t });
                }
            }
            return (0, utility_1.successResponse)(res, 'Beacon claimed', beacon);
        }));
    }
    catch (err) {
        logger_1.default.error('claimBeacon error:', (err === null || err === void 0 ? void 0 : err.message) || err);
        return (0, utility_1.errorResponse)(res, 'Failed to claim beacon');
    }
});
exports.claimBeacon = claimBeacon;
// ---------------------------------------------------------------------------
// GET /beacon/vendor?lan=&log= — active beacons near vendor
// ---------------------------------------------------------------------------
const getActiveBeaconsForVendor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lan, log } = req.query;
        if (!lan || !log) {
            return (0, utility_1.errorResponse)(res, 'lan and log are required');
        }
        const vendorLan = Number(lan);
        const vendorLog = Number(log);
        const now = new Date();
        const beacons = yield Beacon_1.Beacon.findAll({
            where: {
                status: Beacon_1.BeaconStatus.ACTIVE,
                expiresAt: { [sequelize_1.Op.gt]: now },
            },
        });
        const nearby = beacons
            .map((b) => (Object.assign(Object.assign({}, b.toJSON()), { distance: (0, utility_1.getDistanceFromLatLonInKm)(vendorLan, vendorLog, b.lan, b.log) })))
            .filter((b) => b.distance <= RADIUS_MILES);
        return (0, utility_1.successResponse)(res, 'Active beacons for vendor', nearby);
    }
    catch (err) {
        logger_1.default.error('getActiveBeaconsForVendor error:', (err === null || err === void 0 ? void 0 : err.message) || err);
        return (0, utility_1.errorResponse)(res, 'Failed to fetch beacons');
    }
});
exports.getActiveBeaconsForVendor = getActiveBeaconsForVendor;
// ---------------------------------------------------------------------------
// GET /beacon/:id — fetch a single beacon by id (for polling)
// ---------------------------------------------------------------------------
const getBeaconById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const beacon = yield Beacon_1.Beacon.findOne({
            where: { id },
            include: [{ model: BeaconParticipant_1.BeaconParticipant }],
        });
        if (!beacon) {
            return (0, utility_1.errorResponse)(res, 'Beacon not found');
        }
        return (0, utility_1.successResponse)(res, 'Beacon', beacon);
    }
    catch (err) {
        logger_1.default.error('getBeaconById error:', (err === null || err === void 0 ? void 0 : err.message) || err);
        return (0, utility_1.errorResponse)(res, 'Failed to fetch beacon');
    }
});
exports.getBeaconById = getBeaconById;
//# sourceMappingURL=beacon.js.map