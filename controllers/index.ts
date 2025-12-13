// @ts-nocheck comment

import {
  errorResponse,
  getDistanceFromLatLonInKm,
  estimateCarCityTimeRange,
  successResponse,
  formatStripeTimestamp,
} from "../helpers/utility";
import { Request, Response } from "express";
import { LanLog } from "../models/LanLog";
import { Profile } from "../models/Profile";

import Stripe from "stripe";
import config from "../config/configSetup";
import { UserType, Users } from "../models/Users";
import { CartProduct } from "../models/CartProduct";
import { Menu } from "../models/Menus";
import { Events } from "../models/Event";
import { PopularVendor } from "../models/Popular";
import { Tag } from "../models/Tag";
import { SpecialTag } from "../models/SpecialTag";
import { Favourite } from "../models/Favourite";
import { AllTag } from "../models/Alltags";
import { Op, Sequelize } from "sequelize";
import { sequelize } from "./db";
import { Order } from "../models/Order";
import { Extra } from "../models/Extras";
import { sendEmailResend, sendTestEmail } from "../services/sms";
import { templateEmail } from "../config/template";
import { sendToken } from "../services/notification";
import { Rating } from "../models/Rate";
import { OrderV2 } from "../models/OrderV2";
import { successResponse } from "../helpers/utility";
import { ProfileViews } from "../models/ProfileViews";
import { FeaturedEventTrucks } from "../models/FeaturedEventTrucks";
import logger from "../services/logger";

const cloudinary = require("cloudinary").v2;
const stripe = new Stripe(config.STRIPE_SK, {
  apiVersion: "2023-08-16",
});

export const apiIndex = async (req: Request, res: Response) =>
  successResponse(res, "API Working!");

export const updateLocation = async (req: Request, res: Response) => {
  let { Lan, Log, online } = req.body;
  let { id } = req.user;
  const user = await Users.findOne({ where: { id } });
  const lanlog = await LanLog.findOne({ where: { userId: id } });
  if (lanlog) {
    await lanlog.update({ Lan, Log, type: user?.type });
    return successResponse(res, "Updated Successfully");
  }
  return errorResponse(res, "Failed to Update");
};

export const createProfile = async (req: Request, res: Response) => {
  let {
    business_name,
    unique_detail,
    detail,
    phone,
    tag,
    pro_pic,
    address,
    lan,
    log,
    days,
    closeTime,
    openingTime,
  } = req.body;
  try {
    let { id } = req.user;
    const user = await Users.findOne({ where: { id } });
    const lanlog = await LanLog.findOne({ where: { userId: id } });
    const profileExist = await Profile.findOne({ where: { userId: id } });

    if (profileExist) {
      return errorResponse(res, "Profile Already Exist");
    }
    const location = await LanLog.create({
      Lan: lan,
      Log: log,
      address,
      online: true,
      userId: id,
      type: UserType.VENDOR,
    });

    const profile = await Profile.create({
      business_name,
      unique_detail,
      detail,
      phone,
      lanlogId: location!.id,
      userId: id,
      days,
      closeTime,
      openingTime,
      pro_pic,
      tag,
    });
    return successResponse(res, "Created Successfully", profile);
  } catch (error) {
    return errorResponse(res, "Failed to Create Profile");
  }
};

export const updateToken = async (req: Request, res: Response) => {
  let { id } = req.user;
  let { fcmToken } = req.query;
  const user = await Users.findOne({ where: { id } });
  await user?.update({ fcmToken });
  return successResponse(res, "success");
};

export const updateProfile = async (req: Request, res: Response) => {
  let { business_name, unique_detail, detail, phone, tag, pro_pic } = req.body;
  let { id } = req.user;
  const location = await LanLog.findOne({ where: { userId: id } });
  const profile = await Profile.findOne({ where: { userId: id } });
  await profile?.update({
    business_name: business_name ?? profile.business_name,
    unique_detail: unique_detail ?? profile.unique_detail,
    detail: detail ?? profile.detail,
    phone: phone ?? profile.phone,
    lanlogId: location!.id,
    userId: id,
    pro_pic: pro_pic ?? profile.pro_pic,
    tag: tag ?? profile.tag,
  });
  return successResponse(res, "Updated Successfully");
};

export const createSubscription = async (req: Request, res: Response) => {
  const { paymentMethodId } = req.body;
  const { id } = req.user;

  try {
    const user = await Users.findOne({ where: { id } });
    const profile = await Profile.findOne({ where: { userId: user?.id } });

    let customerId = user?.customer_id;

    // ✅ If customer does NOT exist → create
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user!.email,
      });

      customerId = customer.id;

      await user?.update({ customer_id: customerId });
    }

    // ✅ Attach payment method to existing customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // ✅ Update default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // ✅ Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: config.PRICE_ID,
          quantity: 1,
        },
      ],
      default_payment_method: paymentMethodId,
      payment_settings: {
        payment_method_options: {
          card: {
            request_three_d_secure: "any",
          },
        },
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
      trial_period_days: 1,
    });

    await user?.update({ subscription_id: subscription.id });
    await profile?.update({ subcription_id: subscription.id });

    return successResponse(res, "Subscribed successfully");
  } catch (e: any) {
    return errorResponse(res, e.message);
  }
};

// export const createSubscription = async (req: Request, res: Response) => {
//   const { paymentMethodId } = req.body;
//   const { id } = req.user;

//   try {
//     const user = await Users.findOne({ where: { id } });

//     if (!user) {
//       logger.info("User not found with id:", id);
//       return errorResponse(res, "User not found");
//     }
//     const profile = await Profile.findOne({ where: { userId: user?.id } });

//     // 1. Ensure customer exists
//     let customerId = user.customer_id;

//     if (!customerId) {
//       logger.info("Creating new Stripe customer for user:", user.id);
//       const customer = await stripe.customers.create({
//         email: user.email,
//         name: user.fullname,
//       });

//       customerId = customer.id;
//       await user.update({ customer_id: customerId });
//     }

//     // 2. Attach payment method to customer
//     await stripe.paymentMethods.attach(paymentMethodId, {
//       customer: customerId,
//     });

//     // 3. Set as default payment method
//     await stripe.customers.update(customerId, {
//       invoice_settings: {
//         default_payment_method: paymentMethodId,
//       },
//     });

//     // 4. Create Subscription (charges instantly)
//     const subscription = await stripe.subscriptions.create({
//       customer: customerId,
//       items: [{ price: config.PRICE_ID }],
//       default_payment_method: paymentMethodId,
//       payment_behavior: "default_incomplete", // important
//       expand: ["latest_invoice.payment_intent"],
//     });

//     const paymentIntent = subscription.latest_invoice
//       ?.payment_intent as Stripe.PaymentIntent;

//     if (!paymentIntent) {
//       logger.info(
//         "Payment initialization failed for subscription:",
//         subscription.id
//       );
//       return errorResponse(res, "Payment initialization failed");
//     }

//     // 5. Confirm the payment instantly
//     const confirmedIntent = await stripe.paymentIntents.confirm(
//       paymentIntent.id
//     );

//     if (confirmedIntent.status === "succeeded") {
//       logger.info("Payment succeeded for subscription:", subscription.id);
//       await user.update({
//         subscription_id: subscription.id,
//       });
//       await profile?.update({ subcription_id: subscription.id });

//       return successResponse(res, "Subscription created and charged instantly");
//     }

//     return errorResponse(res, "Payment failed or requires further action");
//   } catch (e: any) {
//     logger.error(e);
//     return errorResponse(res, e.message);
//   }
// };

export const cancelSubscription = async (req: Request, res: Response) => {
  let { id } = req.user;
  const user = await Users.findOne({ where: { id } });
  const subscription = await stripe.subscriptions.cancel(user!.subscription_id);
  const status = await stripe.subscriptions.retrieve(user!.subscription_id);
  return successResponse(res, "Canceled Successfully");
};

export const reactivateSubscription = async (req: Request, res: Response) => {
  let { id } = req.user;
  const user = await Users.findOne({ where: { id } });
  const subscription = await stripe.subscriptions.resume(user!.subscription_id);
  return successResponse(res, "You have subscribed to foodtruck.express plan");
};

export const addNewCard = async (req: Request, res: Response) => {
  let { card_number, expiry_month, expiry_year, cvc } = req.body;
  let { id } = req.user;
  const user = await Users.findOne({ where: { id } });
  const profile = await Profile.findOne({ where: { userId: user?.id } });

  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: {
      number: String(card_number),
      exp_month: exp_month,
      exp_year: exp_year,
      cvc: String(cvc),
    },
  });

  await stripe.paymentMethods.attach(paymentMethod.id, {
    customer: user!.customer_id,
  });
  await user?.update({ token_id: token.id, card_id: token.card?.id });
  return successResponse(res, "Added Successfully");
};

export const onlineLanlogVendors = async (req: Request, res: Response) => {
  const { lan, log, range_value } = req.query;
  let distance_list: any[] = [];
  const lanlog = await LanLog.findAll({
    where: {
      type: UserType.VENDOR,
      online: true,
    },
    include: [
      {
        model: Users,
        where: {
          type: UserType.VENDOR,
        },
        attributes: ["createdAt", "updatedAt", "email", "type"],
        required: true,
      },
      { model: Profile, required: true },
    ],
  });

  for (let vendor of lanlog) {
    const distance = getDistanceFromLatLonInKm(
      Number(vendor.Lan),
      Number(vendor.Log),
      Number(lan),
      Number(log)
    );
    // 15

    if (distance <= Number(1500000000)) {
      if (vendor.dataValues.user.dataValues.type == UserType.VENDOR) {
        distance_list.push({
          ...vendor.dataValues,
          user: vendor.dataValues.user.dataValues,
          profile: vendor.dataValues.profile.dataValues,
          distance,
          time: estimateCarCityTimeRange(distance),
        });
        distance_list.sort(
          (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
        );
      }
    }
  }
  return successResponse(res, "Fetched Successfully", distance_list);
};

export const onlineLanlogUser = async (req: Request, res: Response) => {
  const { lan, log, range_value } = req.query;
  const { id } = req.user;
  const user = await Users.findOne({ where: { id } });

  try {
    const subscription = await stripe.subscriptions.retrieve(
      user?.subscription_id
    );
    if (subscription.status == "active" || subscription.status == "trialing") {
      let distance_list: any[] = [];
      const lanlog = await LanLog.findAll({
        where: {
          type: UserType.USER,
          // online: true
        },
        include: [
          {
            model: Users,
            where: {
              type: UserType.USER,
            },
            attributes: ["createdAt", "updatedAt", "email", "type"],
          },
        ],
      });

      for (let user of lanlog) {
        const distance = getDistanceFromLatLonInKm(
          Number(user.Lan),
          Number(user.Log),
          Number(lan),
          Number(log)
        );

        if (distance <= Number(15)) {
          if (user.dataValues.user.dataValues.type == UserType.USER) {
            distance_list.push({
              ...user.dataValues,
              user: user.dataValues.user.dataValues,
              distance,
            });
            distance_list.sort(
              (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
            );
          }
        }
      }

      return res
        .status(200)
        .send({ message: "Fetched Successfully", users: distance_list });
    } else {
      return res.status(200).send({
        message: "Fetched Successfully",
        users:
          "Subscribe to view online User locations and Display your Menu on your profile",
      });
    }
  } catch (e) {
    return res.status(200).send({
      message: "Fetched Successfully",
      users:
        "Subscribe to view online User locations and Display your Menu on your profile",
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  const { id } = req.query;
  const profile = await Profile.findAll({ where: { lanlogId: id } });
  return res.status(200).send({ message: "Fetched Successfully", profile });
};

export const getHomeEvents = async (req: Request, res: Response) => {
  const currentDate = new Date();
  const { lan, log } = req.query;
  let event = [];
  const eventFound = await Events.findAll({
    where: {
      event_date: {
        [Sequelize.Op.gt]: currentDate,
      },
    },
    include: [
      {
        model: FeaturedEventTrucks,
        include: [
          {
            model: Profile,
            include: [
              {
                model: Users,
              },
              { model: LanLog },
            ],
          },
        ],
      },
    ],
  });

  for (let value of eventFound) {
    let distance_list = [];
    for (let vendor of value.featured) {
      const distance = getDistanceFromLatLonInKm(
        Number(vendor.dataValues.profile.dataValues.lanlog.dataValues.Lan),
        Number(vendor.dataValues.profile.dataValues.lanlog.dataValues.Log),
        Number(lan),
        Number(log)
      );
      distance_list.push({
        ...vendor.dataValues.profile.dataValues.lanlog.dataValues,
        user: vendor.dataValues.profile.dataValues.user.dataValues,
        profile: vendor.dataValues.profile.dataValues,
        distance,
        time: estimateCarCityTimeRange(distance),
      });
      distance_list.sort(
        (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
      );
    }
    event.push({ ...value.dataValues, featured: distance_list });
  }
  return successResponse(res, "Fetched Successfully", event);
};

export const getVendorEvent = async (req: Request, res: Response) => {
  const { id } = req.user;
  const event = await Events.findAll({
    where: {
      userId: id,
    },
  });
  return res.status(200).send({ message: "Fetched Successfully", event });
};

export const filterVendorBytag = async (req: Request, res: Response) => {
  const { tag } = req.query;
  const profile = await Profile.findAll({
    where: { tag: tag?.toString().toLowerCase() },
    include: [{ model: Users }, { model: LanLog }],
  });
  return res.status(200).send({ message: "Fetched Successfully", profile });
};

export const getFirstFivePorpular = async (req: Request, res: Response) => {
  const popular = await PopularVendor.findAll({ limit: 10 });
  return res.status(200).send({ message: "Fetched Successfully", popular });
};

export const getReviews = async (req: Request, res: Response) => {
  const { id } = req.query;
  const ratings = await Rating.findAll({
    where: { truckId: id },
    include: [{ model: Users }],
  });
  return successResponse(res, "Fetched Successfully", ratings);
};

export const getCategories = async (req: Request, res: Response) => {
  const tags = await Tag.findAll({});
  return res.status(200).send({ message: "Fetched Successfully", tags });
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.user;
  const user = await Users.findOne({
    where: { id },
  });
  return successResponse(res, "Fetched Successfully", user);
};

export const getVendorUserProfile = async (req: Request, res: Response) => {
  const { id, lan, log } = req.query;
  const vendor = await LanLog.findOne({
    where: {
      userId: id,
    },
    include: [
      {
        model: Users,
        where: {
          type: UserType.VENDOR,
        },
        attributes: [
          "createdAt",
          "updatedAt",
          "email",
          "type",
          "subscription_id",
          "customer_id",
        ],
      },
      { model: Profile },
    ],
  });
  await ProfileViews.create({ profileId: vendor?.profile.id, userId: id });
  const distance = getDistanceFromLatLonInKm(
    Number(vendor.Lan),
    Number(vendor.Log),
    Number(lan),
    Number(log)
  );
  let subscription: unknown;
  try {
    const result = await stripe.subscriptions.retrieve(
      vendor?.user?.subscription_id
    );
    subscription = {
      status: result.status,
      dueDate: formatStripeTimestamp(result.current_period_end),
    };
  } catch (error) {
    subscription = { status: "No Subscription", dueDate: "" };
  }
  return successResponse(res, "Profile Fetched", {
    ...vendor?.dataValues,
    distance,
    time: estimateCarCityTimeRange(distance),
    subscription,
  });
};

export const getVendorByTag = async (req: Request, res: Response) => {
  const { tagName, lan, log, tagId } = req.query;
  const cleanTag = tagName.replace(/[%&*]/g, "");
  let vendors;
  let distance_list = [];
  const specialTag = await SpecialTag.findOne({
    where: {
      tagId,
    },
  });
  if (specialTag) {
    vendors = await Profile.findAll({
      where: {
        specializedTagId: specialTag.id,
      },
      include: [{ model: Users }, { model: LanLog }],
    });
  } else {
    vendors = await Profile.findAll({
      where: Sequelize.literal(
        `LOWER(tag) LIKE '%${cleanTag.toString().toLowerCase()}%'`
      ),
      include: [{ model: Users }, { model: LanLog }],
    });
  }
  for (let vendor of vendors) {
    const profile = vendor.dataValues;
    const distance = getDistanceFromLatLonInKm(
      Number(vendor.dataValues.lanlog.dataValues.Lan),
      Number(vendor.dataValues.lanlog.dataValues.Log),
      Number(lan),
      Number(log)
    );

    if (distance <= Number(15000000000)) {
      if (vendor.user.dataValues.type == UserType.VENDOR) {
        distance_list.push({
          ...vendor.dataValues.lanlog.dataValues,
          user: vendor.dataValues.user.dataValues,
          profile,
          distance,
          time: estimateCarCityTimeRange(distance),
        });
        distance_list.sort(
          (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
        );
      }
    }
  }
  return successResponse(res, "Vendor Fetched", distance_list);
};

export const getVendorProfileV2 = async (req: Request, res: Response) => {
  const { id } = req.user;
  const profile = await LanLog.findOne({
    where: {
      userId: id,
    },
    include: [
      {
        model: Users,
        where: {
          type: UserType.VENDOR,
        },
        attributes: ["createdAt", "updatedAt", "email", "type"],
      },
      { model: Profile },
    ],
  });
  return successResponse(res, "Profile Fetched", profile);
};

export const getMainVendorProfile = async (req: Request, res: Response) => {
  const { id } = req.user;
  const profile = await Profile.findOne({
    where: {
      userId: id,
    },
    include: [
      {
        model: Users,
      },
      { model: LanLog },
    ],
  });
  let subscription: unknown;
  try {
    const result = await stripe.subscriptions.retrieve(
      profile?.user.subscription_id
    );
    subscription = {
      status: result.status,
      dueDate: formatStripeTimestamp(result.current_period_end),
    };
    logger.info("Subscription retrieved successfully:", subscription);
  } catch (error) {
    logger.error(error);
    subscription = { status: "No Subscription", dueDate: "" };
  }
  return successResponse(res, "Profile Fetched", { profile, subscription });
};

export const getVendorOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await OrderV2.findAll({
    where: { profileId: id },
    include: [
      { model: Profile, include: [{ model: LanLog }] },
      { model: Users },
      { model: CartProduct, include: [{ model: Menu }] },
    ],
  });
  return successResponse(res, "Fetched Successfully", order);
};

export const getVendorProfile = async (req: Request, res: Response) => {
  const { id } = req.user;
  const profile = await Profile.findOne({
    where: { userId: id },
    include: [{ model: Users }, { model: LanLog }],
  });
  const menus = await Menu.findAll({
    where: { userId: id },
    include: [{ model: Extra }],
  });

  const events = await Events.findAll({ where: { userId: id } });
  const order = await Order.findAll({
    where: { profileId: profile?.id },
    include: [{ model: Menu }, { model: Users }],
  });
  return res.status(200).send({
    message: "Fetched Successfully",
    profile: {
      menus,
      events,
      order,
      profile: profile,
    },
  });
};

export const getLanLog = async (req: Request, res: Response) => {
  const { id } = req.user;
  const lanlog = await LanLog.findAll({
    where: { userId: id },
    include: [
      {
        model: Users,
        attributes: ["createdAt", "updatedAt", "subscription_id"],
      },
    ],
  });
  return res.status(200).send({ message: "Fetched Successfully", lanlog });
};

export const updateLanLog = async (req: Request, res: Response) => {
  try {
    const { online } = req.body;
    const { id } = req.user;
    const lanlog = await LanLog.findOne({ where: { userId: id } });
    await lanlog?.update({ online });
    return successResponse(res, "Fetched Successfully");
  } catch (error) {
    logger.error(error);
    return errorResponse(res, "Failed to update lanlog");
  }
};

export const rateProfile = async (req: Request, res: Response) => {
  const { id, rate } = req.body;
  const profile = await Profile.findOne({ where: { id } });
  const truckUser = await Users.findOne({ where: { id: profile.userId } });
  await Rating.create({
    profileId: profile?.id,
    rate,
    truckId: truckUser?.id,
    userId: req.user.id,
  });
  await profile?.update({
    totalRate: profile.totalRate + 1,
    meanRate: profile.meanRate + Number(rate),
    rate: (profile.meanRate + Number(rate)) / (profile.totalRate + 1),
  });
  return res.status(200).send({ message: "Fetched Successfully", profile });
};

export const fetchRate = async (req: Request, res: Response) => {
  const { id } = req.query;
  const rate = await Rating.findAll({
    where: { userId: req.user.id, profileId: id },
  });
  return res.status(200).send({ message: "Fetched Successfully", rate });
};

export const vendorMenu = async (req: Request, res: Response) => {
  const { id } = req.query;
  const menu = await Menu.findAll({
    where: { userId: id },
    include: [{ model: Extra }],
  });
  return successResponse(res, "Fetched Successfully", menu);
  // stripe.subscriptions.retrieve(user?.subscription_id).then(
  //     function (subscription_status) {
  //         if (subscription_status.status == 'active' || subscription_status.status == 'trialing') {

  //             return res.status(200).send({
  //                 message: "Fetched Successfully",
  //                 menu
  //             })
  //         } else {
  //             sendToken(user?.id, `Foodtruck.express`.toUpperCase(),
  //                 `Hey ${profile?.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`
  //             );
  //             sendEmailResend(`${user?.email}`,
  //                 "Foodtruck.express".toUpperCase(),
  //                 templateEmail(`${user?.email}`, `Hey ${profile?.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`))
  //             return res.status(200).send({ message: "VENDOR MENU IS UNAVAILABLE", status: false })
  //         }
  //     },
  //     function (err) {
  //         if (err instanceof Stripe.errors.StripeError) {
  //             // Break down err based on err.type

  //             sendToken(user?.id, `Foodtruck.express`.toUpperCase(),
  //                 `Hey ${profile?.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`
  //             );
  //             sendEmailResend(`${user?.email}`,
  //                 "Foodtruck.express".toUpperCase(),
  //                 templateEmail(`${user?.email}`, `Hey ${profile?.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`))

  //             console.log(err.type)
  //             return res.status(200).send({ message: "VENDOR MENU IS UNAVAILABLE", status: false })
  //         } else {

  //             // ...
  //             sendToken(user?.id, `Foodtruck.express`.toUpperCase(),
  //                 `Hey ${profile?.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`
  //             );
  //             sendEmailResend(`${user?.email}`,
  //                 "Foodtruck.express".toUpperCase(),
  //                 templateEmail(`${user?.email}`, `Hey ${profile?.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`))
  //             console.log(err)
  //             return res.status(200).send({ message: "VENDOR MENU IS UNAVAILABLE", status: false })
  //         }
  //     }
  // );
};

export const vendorEvent = async (req: Request, res: Response) => {
  const { id } = req.query;
  const user = await Users.findOne({ where: { id } });
  const event = await Events.findAll({
    where: { userId: id },
    include: [{ model: Users, include: [{ model: Profile }] }],
  });
  console.log(user?.subscription_id);
  const subscription_status = await stripe.subscriptions
    .retrieve(user?.subscription_id)
    .then(
      function (subscription_status) {
        if (
          subscription_status.status == "active" ||
          subscription_status.status == "trialing"
        ) {
          // const menu = await Menu.findAll({ where: { userId: id }, include: [{ model: Extra }] })
          return res.status(200).send({
            message: "Fetched Successfully",
            event,
          });
        } else {
          return res
            .status(200)
            .send({ message: "VENDOR EVENT IS UNAVAILABLE", status: false });
        }
      },
      function (err) {
        if (err instanceof Stripe.errors.StripeError) {
          // Break down err based on err.type
          console.log(err.type);
          return res
            .status(200)
            .send({ message: "VENDOR EVENT IS UNAVAILABLE", status: false });
        } else {
          // ...
          console.log(err);
          return res
            .status(200)
            .send({ message: "VENDOR EVENT IS UNAVAILABLE", status: false });
        }
      }
    );
};

export const getMenu = async (req: Request, res: Response) => {
  const { id } = req.user;
  const user = await Users.findOne({ where: { id } });
  console.log(user?.subscription_id);
  const menus = await Menu.findAll({
    where: { userId: id },
    include: [{ model: Extra }],
  });
  return successResponse(res, "Fetched Successfully", menus);
};

export const getAllCategories = async (req: Request, res: Response) => {
  const tags = await AllTag.findAll({ order: [["createdAt", "ASC"]] });
  tags.reverse();
  return successResponse(res, "Fetched Successfully", tags);
};

export const getHomeDetails = async (req: Request, res: Response) => {
  const tags = await SpecialTag.findAll({ include: [{ model: Tag }] });
  const profileSecondTag = await Profile.findAll({
    where: {
      [Op.or]: [
        {
          tag: {
            [Op.like]:
              "%" +
              `${tags[0].dataValues.tag.title?.toString().toLowerCase()}` +
              "%",
          },
        },
      ],
    },
    include: [{ model: Users }, { model: LanLog }],
  });
  const profileFirstTag = await Profile.findAll({
    where: {
      [Op.or]: [
        {
          tag: {
            [Op.like]:
              "%" +
              `${tags[1].dataValues.tag.title?.toString().toLowerCase()}` +
              "%",
          },
        },
      ],
    },
    include: [{ model: Users }, { model: LanLog }],
  });
  const currentDate = new Date();
  console.log(currentDate);
  const event = await Events.findAll({
    where: {
      formated_date: {
        [Sequelize.Op.gte]: currentDate,
      },
    },
    include: [{ model: Users, include: [{ model: Profile }] }],
  });
  const popular = await PopularVendor.findAll({
    limit: 10,
    include: [
      {
        model: Profile,
        include: [{ model: Users }, { model: LanLog }],
      },
    ],
  });

  // Manipulate the data to add a custom field
  const modifiedData = profileFirstTag.map((item) => {
    // Add a custom field to each item in the list
    return {
      ...item.get(), // Retrieve the item as a plain object
      number: 1, // Add your custom field here
    };
  });

  // Manipulate the data to add a custom field
  const modifiedData2 = profileSecondTag.map((item) => {
    // Add a custom field to each item in the list
    return {
      ...item.get(), // Retrieve the item as a plain object
      number: 2, // Add your custom field here
    };
  });

  return res.status(200).send({
    vendors: modifiedData.concat(modifiedData2),
    message: "Fetched Successfully",
    event,
    popular,
    tags,
  });
};

export const deleteMenu = async (req: Request, res: Response) => {
  const { id } = req.params;
  const menu = await Menu.findOne({ where: { id } });
  await menu?.destroy();
  return successResponse(res, "Deleted Successfully");
};

export const createMenu = async (req: Request, res: Response) => {
  const { id } = req.user;
  const { menu_title, menu_description, menu_price, extra, menu_picture } =
    req.body;
  const user = await Users.findOne({ where: { id } });
  const lanlog = await LanLog.findOne({ where: { userId: user?.id } });
  const menu = await Menu.create({
    menu_title,
    menu_description,
    menu_price,
    lanlogId: lanlog?.id,
    userId: user?.id,
    menu_picture,
  });

  let valueExtra = [];
  for (let value of extra ?? []) {
    valueExtra.push({
      extra_title: value.extra_title,
      extra_description: value.extra_description,
      extra_price: value.extra_price,
      menuId: menu.id,
    });
  }
  await Extra.bulkCreate(valueExtra);
  return successResponse(res, "Created Successfully");
};

export const updateMenu = async (req: Request, res: Response) => {
  const { id } = req.query;
  // console.log(userId);
  const { menu_title, menu_description, menu_price, menu_picture, extra } =
    req.body;

  const user = await Users.findOne({ where: { id: req.user.id } });
  const lanlog = await LanLog.findOne({ where: { userId: user?.id } });
  const menu = await Menu.findOne({ where: { id } });
  const extras = await Extra.findAll({ where: { menuId: id } });

  let ids = [];
  for (let value of extras ?? []) {
    ids.push(value.id);
  }

  await Extra.destroy({ where: { id: ids } });
  await menu.update({
    menu_title: menu_title ?? menu?.menu_title,
    menu_description: menu_description ?? menu?.menu_description,
    menu_price: menu_price ?? menu?.menu_price,
    lanlogId: lanlog?.id,
    menu_picture: menu_picture ?? menu?.menu_picture,
    userId: user?.id,
  });
  let valueExtra = [];
  for (let value of extra ?? []) {
    valueExtra.push({
      extra_title: value.extra_title,
      extra_description: value.extra_description,
      extra_price: value.extra_price,
      menuId: menu.id,
    });
  }
  await Extra.bulkCreate(valueExtra);
  return successResponse(res, "Updated Successfully");
};

export const updateEvent = async (req: Request, res: Response) => {
  const { id } = req.query;

  // console.log(userId);
  const { event_title, event_description, event_date, event_address } =
    req.body;
  console.log(event_date);
  const user = await Users.findOne({ where: { id: req.user.id } });
  let [day, month, year] = event_date.split("-");
  day = Number(day) + 1;
  const formattedDate = new Date(`${year}-${month}-${day}`);

  if (req.file) {
    const result = await cloudinary.uploader.upload(
      req.file.path.replace(/ /g, "_")
    );
    const event = await Events.findOne({ where: { id } });

    await event.update({
      event_title: event_title ?? event?.event_title,
      event_description: event_description ?? event?.event_description,
      event_date: event_date ?? event?.event_date,
      formated_date: event_date == null ? event?.formated_date : formattedDate,
      event_address: event_address ?? event?.event_address,
      menu_picture: result.secure_url,
    });

    return res.status(200).send({ message: "Updated Successfully", event });
  } else {
    const event = await Events.findOne({ where: { id } });

    await event.update({
      event_title: event_title ?? event?.event_title,
      event_description: event_description ?? event?.event_description,
      event_date: event_date ?? event?.event_date,
      formated_date: event_date == null ? event?.formated_date : formattedDate,
      event_address: event_address ?? event?.event_address,
    });

    return res.status(200).send({ message: "Updated Successfully", event });
  }
};

// Menu

//Events

export const getEvent = async (req: Request, res: Response) => {
  const { id } = req.user;
  const user = await Users.findOne({ where: { id } });
  console.log(user?.subscription_id);
  const events = await Events.findAll({ where: { userId: id } });
  return res.status(200).send({ message: "Fetched Successfully", events });
};

export const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const events = await Events.findOne({ where: { id } });
  await events?.destroy();
  return res.status(200).send({ message: "Deleted Successfully", events });
};

export const sendTestEmailCon = async (req: Request, res: Response) => {
  const send = await sendEmailResend(
    "dailydevo9@gmail.com",
    "TEST",
    templateEmail("TEST", "dailydevo9@gmail.com".toString())
  );
  return res.status(200).send({ message: "Successfully", send });
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const {
      event_title,
      event_description,
      event_close_time,
      event_start_time,
      menu_picture,
      event_date,
      event_address,
    } = req.body;

    let [day, month, year] = event_date.split("-");
    day = Number(day) + 1;
    const formattedDate = new Date(`${year}-${month}-${day}`);
    const event = await Events.create({
      event_title,
      event_description,
      event_address,
      event_close_time,
      event_start_time,
      event_date: formattedDate,
      menu_picture,
    });
    return res.status(200).send({ message: "Created Successfully", event });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ message: "Failed" });
  }
};
