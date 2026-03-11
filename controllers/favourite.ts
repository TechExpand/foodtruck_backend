// @ts-nocheck comment

import {
  errorResponse,
  getDistanceFromLatLonInKm,
  successResponse,
} from "../helpers/utility";
import { Request, Response, query } from "express";
import { LanLog } from "../models/LanLog";
import { Profile } from "../models/Profile";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import Stripe from "stripe";
import { UserType, Users } from "../models/Users";
import { Menu } from "../models/Menus";
import { Events } from "../models/Event";
import { PopularVendor } from "../models/Popular";
import { Tag } from "../models/Tag";
import config from "../config/configSetup";
import { SpecialTag } from "../models/SpecialTag";
import { Favourite } from "../models/Favourite";
import { fn, literal, Op, where } from "sequelize";
import { Order } from "../models/Order";
import { sendToken } from "../services/notification";
import { sendEmailResend } from "../services/sms";
import { templateEmail } from "../config/template";
import { CartProduct } from "../models/CartProduct";
import { OrderV2 } from "../models/OrderV2";
import { Rating } from "../models/Rate";
import { ProfileViews } from "../models/ProfileViews";
import { Notification, NotificationType } from "../models/Notification";
import { AllTag } from "../models/Alltags";
import logger from "../services/logger";
import { getPromoSubscriptionStatus } from "./index";

const cloudinary = require("cloudinary").v2;
const stripe = new Stripe(config.STRIPE_SK, {
  apiVersion: "2023-08-16",
});

export const getFavourite = async (req: Request, res: Response) => {
  const { lan, log } = req.query;
  const favourite = await Favourite.findAll({
    include: [
      { model: Profile, include: [{ model: LanLog }] },
      { model: Users },
    ],
  });
  let vendor = [];
  for (let favouriteValue of favourite) {
    const distance = getDistanceFromLatLonInKm(
      Number(
        favouriteValue.dataValues.profile.dataValues.lanlog.dataValues.Lan
      ),
      Number(
        favouriteValue.dataValues.profile.dataValues.lanlog.dataValues.Log
      ),
      Number(lan),
      Number(log)
    );
    vendor.push({ ...favouriteValue.dataValues, distance });
  }
  return successResponse(res, "Fetched Successfully", vendor);
};

export const getTags = async (req: Request, res: Response) => {
  const specialized_tags = await SpecialTag.findAll();
  const all_tags = await AllTag.findAll();
  let tags = [];
  for (let value of all_tags) {
    if (specialized_tags.find((tag) => tag.tagId === value.id)) continue;
    tags.push(value);
  }
  return successResponse(res, "Fetched Successfully", tags);
};

export const getOrder = async (req: Request, res: Response) => {
  const { id } = req.user;
  const order = await Order.findAll({
    where: { userId: id },
    include: [
      { model: Profile, include: [{ model: LanLog }] },
      { model: Users },
      { model: Menu },
    ],
  });
  return successResponse(res, "Fetched Successfully", order);
};

export const getNotifications = async (req: Request, res: Response) => {
  const { id } = req.user;
  const notification = await Notification.findAll({
    where: { userId: id },
  });
  return successResponse(res, "Fetched Successfully", notification);
};

export const getOrderV2 = async (req: Request, res: Response) => {
  const { id } = req.user;
  const order = await OrderV2.findAll({
    where: { userId: id },
    include: [
      { model: Profile, include: [{ model: LanLog }] },
      { model: Users },
      { model: CartProduct, include: [{ model: Menu }] },
    ],
    order: [["createdAt", "DESC"]],
  });
  return successResponse(res, "Fetched Successfully", order);
};

export const notifyOrder = async (req: Request, res: Response) => {
  try {
    const { status, orderid } = req.query;

    const order = await Order.findOne({
      where: { id: orderid },
      include: [{ model: Profile }, { model: Menu }, { model: Users }],
    });
    const userData = await Users.findOne({ where: { id: order?.userId } });
    if (!order) return errorResponse(res, "Not Found");
    if (status == "PENDING") {
      await Notification.create({
        title:
          `${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(),
        userId: order.profile.userId,
        description: `pick up your meal at ${order.profile.dataValues.business_name}`,
        type: NotificationType.ORDER,
      });
      await order.update({ status: "COMPLETED" });
      await sendToken(
        userData?.id,
        `${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(),
        `pick up your meal at ${order.profile.dataValues.business_name}`
      );
      await sendEmailResend(
        `${userData?.email}`,
        `${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(),
        templateEmail(
          `${userData.email}`,
          `pick up your meal at ${order.profile.dataValues.business_name}`
        )
      );
      return successResponse(res, "Fetched Successfully", order);
    } else {
      await Notification.create({
        userId: order?.userId,
        title:
          `REMINDER: ${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(),
        description: `pick up your meal at ${order.profile.dataValues.business_name}`,
        type: NotificationType.ORDER,
      });
      await sendToken(
        userData?.id,
        `REMINDER: ${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(),
        `pick up your meal at ${order.profile.dataValues.business_name}`
      );
      await sendEmailResend(
        `${userData.email}`,
        `REMINDER: ${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(),
        templateEmail(
          `${userData.email}`,
          `pick up your meal at ${order.profile.dataValues.business_name}`
        )
      );
      return successResponse(res, "Fetched Successfully", order);
    }
  } catch (error: any) {
    logger.error(error);
    return errorResponse(res, "Error Processing Request");
  }
};

export const confirmOrderV2 = async (req: Request, res: Response) => {
  try {
    const { orderid, rate, comment } = req.body;
    const order = await OrderV2.findOne({
      where: { id: orderid },
      include: [{ model: Profile }, { model: Users }],
    });
    const userData = await Users.findOne({
      where: { id: order?.profile.userId },
    });
    const profile = await Profile.findOne({ where: { id: order?.profileId } });
    if (!order) return errorResponse(res, "No Found");
    if (!profile) return errorResponse(res, "No Found");
    if (!userData) return errorResponse(res, "No Found");
    if (order.status == "CONFIRM_COMPLETION") {
      await order.update({ status: "COMPLETED" });
      await Rating.create({
        profileId: order?.profileId,
        rate,
        comment,
        truckId: order?.profile.userId,
        userId: order.userId,
      });
      await profile?.update({
        totalRate: order?.profile.totalRate + 1,
        meanRate: order?.profile.meanRate + Number(rate),
        rate:
          (order?.profile.meanRate + Number(rate)) /
          (order?.profile.totalRate + 1),
      });
      await Notification.create({
        userId: order?.profile.userId,
        title: `ORDER HAS BEEN CONFIRM`,
        description: `congratulations order has been confirmed by ${order.user.username}`,
        type: NotificationType.NORMAL,
      });
      await sendToken(
        userData?.id,
        `ORDER HAS BEEN CONFIRM`,
        `congratulations order has been confirmed by ${order.user.username}`
      );
      await sendEmailResend(
        `${userData?.email}`,
        `ORDER HAS BEEN CONFIRM`,
        templateEmail(
          `${userData.email}`,
          `congratulations order has been confirmed by ${order.user.username}`
        )
      );
      return successResponse(res, "Fetched Successfully", order);
    } else {
      return successResponse(res, "Fetched Successfully", order);
    }
  } catch (error: any) {
    logger.error(error);
    return errorResponse(res, "Error Processing Request");
  }
};

export const cancelOrderV2 = async (req: Request, res: Response) => {
  try {
    const { orderid, status } = req.body;
    const order = await OrderV2.findOne({
      where: { id: orderid },
      include: [{ model: Profile }, { model: Users }],
    });
    const userData = await Users.findOne({ where: { id: order?.userId } });
    if (!order) return errorResponse(res, "No Found");
    if (status == "CANCELED") {
      await order.update({ status: "CANCELED" });
      await Notification.create({
        userId: order?.userId,
        title: `YOUR ORDER HAS BEEN CANCELED`,
        description: `unfortunately your order has been canceled by ${order.profile.dataValues.business_name}`,
        type: NotificationType.ORDER,
      });
      await sendToken(
        userData?.id,
        `YOUR ORDER HAS BEEN CANCELED`,
        `unfortunately your order has been canceled by ${order.profile.dataValues.business_name}`
      );
      await sendEmailResend(
        `${userData?.email}`,
        `YOUR ORDER HAS BEEN CANCELED`,
        templateEmail(
          `${userData.email}`,
          `unfortunately your order has been canceled by ${order.profile.dataValues.business_name}`
        )
      );
      return successResponse(res, "Fetched Successfully", order);
    } else {
      return successResponse(res, "Fetched Successfully", order);
    }
  } catch (error: any) {
    logger.error(error);
    return errorResponse(res, "Error Processing Request");
  }
};

export const notifyOrderV2 = async (req: Request, res: Response) => {
  try {
    const { status, orderid } = req.body;

    const order = await OrderV2.findOne({
      where: { id: orderid },
      include: [
        { model: Profile },
        //     { model: Menu },
        { model: Users },
      ],
    });
    const userData = await Users.findOne({ where: { id: order?.userId } });
    if (!order) return errorResponse(res, "No Found");
    if (status == "PROCESSING") {
      await order.update({ status: "CONFIRM_COMPLETION" });
      await Notification.create({
        userId: order?.userId,
        title: `YOUR ORDER IS READY FOR PICKUP`.toUpperCase(),
        description: `pick up your meal at ${order.profile.dataValues.business_name}`,
        type: NotificationType.ORDER,
      });
      await sendToken(
        userData?.id,
        `YOUR ORDER IS READY FOR PICKUP`.toUpperCase(),
        `pick up your meal at ${order.profile.dataValues.business_name}`
      );
      await sendEmailResend(
        `${userData?.email}`,
        `YOUR ORDER IS READY FOR PICKUP`.toUpperCase(),
        templateEmail(
          `${userData.email}`,
          `pick up your meal at ${order.profile.dataValues.business_name}`
        )
      );
      return successResponse(res, "Fetched Successfully", order);
    } else if (status == "PENDING") {
      await Notification.create({
        userId: order?.userId,
        title: `Payment Received by ${order.profile.dataValues.business_name}: YOUR ORDER IS CURRENTLY BEING PROCESSED`,
        description: `your meal will be ready soon`,
        type: NotificationType.ORDER,
      });
      await order.update({ status: "PROCESSING" });
      await sendToken(
        userData?.id,
        `Payment Received by ${order.profile.dataValues.business_name}: YOUR ORDER IS CURRENTLY BEING PROCESSED`,
        `your meal will be ready soon`
      );
      await sendEmailResend(
        `${userData?.email}`,
        `Payment Received by ${order.profile.dataValues.business_name}: YOUR ORDER IS CURRENTLY BEING PROCESSED`,
        templateEmail(`${userData.email}`, `your meal will be ready soon`)
      );
      return successResponse(res, "Fetched Successfully", order);
    } else if (status == "CONFIRM_COMPLETION" || status == "COMPLETED") {
      await Notification.create({
        userId: order?.userId,
        title: `REMINDER: YOUR ORDER IS READY FOR PICKUP`.toUpperCase(),
        description: `pick up your meal at ${order.profile.dataValues.business_name}`,
        type: NotificationType.ORDER,
      });
      await sendToken(
        userData?.id,
        `REMINDER: YOUR ORDER IS READY FOR PICKUP`.toUpperCase(),
        `pick up your meal at ${order.profile.dataValues.business_name}`
      );
      await sendEmailResend(
        `${userData.email}`,
        `REMINDER: YOUR ORDER IS READY FOR PICKUP`.toUpperCase(),
        templateEmail(
          `${userData.email}`,
          `pick up your meal at ${order.profile.dataValues.business_name}`
        )
      );
      return successResponse(res, "Fetched Successfully", order);
    }
  } catch (error: any) {
    logger.error(error);
    return errorResponse(res, "Error Processing Request");
  }
};

export const postFavourite = async (req: Request, res: Response) => {
  let { profileId } = req.body;
  let { id } = req.user;
  const user = await Users.findOne({ where: { id } });
  const profile = await Profile.findOne({ where: { id: profileId } });
  const truckUser = await Users.findOne({ where: { id: profile?.userId } });
  const fav = await Favourite.findOne({ where: { profileId, userId: id } });
  if (fav) return errorResponse(res, "Vendor Already Added");
  const createFavourite = await Favourite.create({ profileId, userId: id });
  const favourite = await Favourite.findOne({
    where: {
      id: createFavourite.id,
    },
    include: [
      { model: Profile, include: [{ model: LanLog }] },
      { model: Users },
    ],
  });
  await Notification.create({
    userId: truckUser?.id,
    title: `Foodtruck.express`.toUpperCase(),
    description: `Hey ${profile?.business_name}, Customers are adding your truck to their favorites list on foodtruck.express, subscribe to get more attention.`,
    type: NotificationType.NORMAL,
  });
  sendToken(
    truckUser?.id,
    `Foodtruck.express`.toUpperCase(),
    `Hey ${profile?.business_name}, Customers are adding your truck to their favorites list on foodtruck.express, subscribe to get more attention.`
  );

  return successResponse(res, "Added Successfully", favourite);
};

export const postOrder = async (req: Request, res: Response) => {
  try {
    let { profileId, menuId, extras } = req.body;
    let { id } = req.user;
    let profile = await Profile.findOne({ where: { id: profileId } });
    let user = await Users.findOne({ where: { id: profile?.userId } });
    await Notification.create({
      userId: user?.id,
      title: `Foodtruck.express`.toUpperCase(),
      description:
        "You have recieved an order, please process the pending order.",
      type: NotificationType.ORDER,
    });
    sendToken(
      user?.id,
      `Foodtruck.express`.toUpperCase(),
      "You have recieved an order, please process the pending order."
    );
    sendEmailResend(
      `${user?.email}`,
      "Foodtruck.express".toUpperCase(),
      templateEmail(
        `${user?.email}`,
        "You have recieved an order, please process the pending order."
      )
    );
    const order = await Order.create({
      profileId: profileId,
      userId: id,
      menuId,
      extras: extras,
    });
    return successResponse(res, "Order Added Successfully");
  } catch (error: any) {
    logger.error(error);
    return errorResponse(res, "Error Processing Request");
  }
};

export const postOrderV2 = async (req: Request, res: Response) => {
  try {
    const { profileId, menus, phone, note, total } = req.body;
    const { id } = req.user;

    if (!menus) {
      menus = [
        {
          menuId: 1,
          extras: [{ name: "ketchup", price: 100 }],
        },
      ];
    }
    const tempMenu: any[] = [];
    const order = await OrderV2.create({
      profileId: profileId,
      userId: id,
      phone,
      note,
      total,
    });
    for (var value of menus) {
      tempMenu.push({
        userId: id,
        order: order.id,
        ...value,
      });
    }
    await CartProduct.bulkCreate(tempMenu);
    const profile = await Profile.findOne({ where: { id: profileId } });
    const user = await Users.findOne({ where: { id: profile?.userId } });
    await Notification.create({
      userId: user?.id,
      title: `Foodtruck.express`.toUpperCase(),
      description:
        "You have recieved an order, please process the pending order.",
      type: NotificationType.NORMAL,
    });
    sendToken(
      user?.id,
      `Foodtruck.express`.toUpperCase(),
      "You have recieved an order, please process the pending order."
    );
    sendEmailResend(
      `${user?.email}`,
      "Foodtruck.express".toUpperCase(),
      templateEmail(
        `${user?.email}`,
        "You have recieved an order, please process the pending order."
      )
    );
    console.log(`${user?.email}`);
    return successResponse(res, "Order Added Successfully");
  } catch (error: any) {
    logger.error(error);
    return errorResponse(res, "Error Processing Request");
  }
};

export const getp = async (req: Request, res: Response) => {
  const profile = await Profile.findAll({});
  return res
    .status(200)
    .send({ message: "Vendor Added Successfully", profile, status: true });
};

export const deleteFavourite = async (req: Request, res: Response) => {
  let { id } = req.body;
  const favourite = await Favourite.findOne({ where: { id } });
  await favourite?.destroy();
  return res
    .status(200)
    .send({ message: "Deleted Successfully", status: true });
};

export const search = async (req: Request, res: Response) => {
  let { value, lan, log } = req.query;
  value = value?.toString().replace("+", " ");

  let valueSearch: any = {};
  if (value && value != "") {
    valueSearch = {
      [Op.or]: [
        { business_name: { [Op.like]: "%" + value + "%" } },
        { tag: { [Op.like]: "%" + value + "%" } },
        { unique_detail: { [Op.like]: "%" + value + "%" } },
        { detail: { [Op.like]: "%" + value + "%" } },
      ],
    };
  }
  const vendors = await Profile.findAll({
    where: { ...valueSearch },
    include: [{ model: Users }, { model: LanLog }],
  });

  let vendor: any[] = [];

  for (let vendorValue of vendors) {
    const distance = getDistanceFromLatLonInKm(
      Number(vendorValue.dataValues.lanlog.dataValues.Lan),
      Number(vendorValue.dataValues.lanlog.dataValues.Log),
      Number(lan),
      Number(log)
    );

    if (distance <= Number(15)) {
      if (vendorValue.dataValues.user.dataValues.type == UserType.VENDOR) {
        vendor.push(vendorValue.dataValues);
      }
    }
  }
  successResponse(res, "Successful", vendor);
};

export const getDashboardStats = async (req: Request, res: Response) => {
  const profileId = req.query.profileId;
  if (!profileId) {
    return errorResponse(res, "profileId is required");
  }

  const profile = await Profile.findOne({
    where: { id: profileId },
    include: [{ model: Users }],
  });
  if (!profile?.user) {
    return errorResponse(res, "Profile not found");
  }

  const subId = profile.user.subscription_id;
  if (subId?.startsWith?.("PROMO_")) {
    const promoStatus = await getPromoSubscriptionStatus(
      profile.id,
      subId
    );
    if (!promoStatus?.active) {
      return res.status(403).send({
        message: "Analytics are only available during your active subscription period.",
        status: false,
      });
    }
  } else if (subId) {
    try {
      const sub = await stripe.subscriptions.retrieve(subId);
      if (sub.status !== "active" && sub.status !== "trialing") {
        return res.status(403).send({
          message: "Analytics are only available with an active subscription.",
          status: false,
        });
      }
    } catch (_) {
      return res.status(403).send({
        message: "Analytics are only available with an active subscription.",
        status: false,
      });
    }
  } else {
    return res.status(403).send({
      message: "Analytics are only available with an active subscription.",
      status: false,
    });
  }

  const today = new Date();
  const startToday = startOfDay(today);
  const endToday = endOfDay(today);

  const lastMonthStart = startOfMonth(subMonths(today, 1));
  const lastMonthEnd = endOfMonth(subMonths(today, 1));

  const thisMonthStart = startOfMonth(today);
  const thisMonthEnd = endOfMonth(today);

  // Total orders
  const totalOrders = await OrderV2.count({
    where: { profileId: req.query.profileId },
  });
  const lastMonthOrders = await OrderV2.count({
    where: {
      profileId: req.query.profileId,
      createdAt: { [Op.between]: [lastMonthStart, lastMonthEnd] },
    },
  });

  // Completed orders
  const completedOrders = await OrderV2.count({
    where: { status: "COMPLETED", profileId: req.query.profileId },
  });
  const lastMonthCompletedOrders = await OrderV2.count({
    where: {
      status: "COMPLETED",
      profileId: req.query.profileId,
      createdAt: { [Op.between]: [lastMonthStart, lastMonthEnd] },
    },
  });

  // Completed orders
  const profileViews = await ProfileViews.count({
    where: { profileId: req.query.profileId },
  });
  const lastMonthProfileViews = await ProfileViews.count({
    where: {
      profileId: req.query.profileId,
      createdAt: { [Op.between]: [lastMonthStart, lastMonthEnd] },
    },
  });

  // Today sales
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const todayResult = await OrderV2.findAll({
    where: {
      profileId: req.query.profileId,
      status: "COMPLETED",
      createdAt: {
        [Op.between]: [todayStart, todayEnd],
      },
    },
    include: [
      {
        model: CartProduct,
        include: [Menu],
      },
    ],
  });

  // Get the current date
  const now = new Date();

  // Get start of yesterday
  const startOfYesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
    0,
    0,
    0
  );

  // Get end of yesterday
  const endOfYesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
    23,
    59,
    59
  );

  const yesterdayResult = await OrderV2.findAll({
    where: {
      profileId: req.query.profileId,
      status: "COMPLETED",
      createdAt: {
        [Op.between]: [startOfYesterday, endOfYesterday],
      },
    },
    include: [
      {
        model: CartProduct,
        include: [Menu],
      },
    ],
  });

  let yesterdayTodaySales = 0;
  let todaySales = 0;

  for (const order of yesterdayResult) {
    for (const cartProduct of order.menu) {
      const menuPrice = parseFloat(cartProduct.menu.menu_price || 0);
      let extrasPrice = 0;
      try {
        const extras = JSON.parse(cartProduct.extras || "[]");
        extrasPrice = extras.reduce(
          (sum, item) => sum + parseFloat(item.price || 0),
          0
        );
      } catch (e) {
        console.warn("Invalid extras JSON:", cartProduct.extras);
      }

      yesterdayTodaySales += menuPrice + extrasPrice;
    }
  }

  for (const order of todayResult) {
    for (const cartProduct of order.menu) {
      const menuPrice = parseFloat(cartProduct.menu.menu_price || 0);
      let extrasPrice = 0;
      try {
        const extras = JSON.parse(cartProduct.extras || "[]");
        extrasPrice = extras.reduce(
          (sum, item) => sum + parseFloat(item.price || 0),
          0
        );
      } catch (e) {
        console.warn("Invalid extras JSON:", cartProduct.extras);
      }

      todaySales += menuPrice + extrasPrice;
    }
  }

  // Lifetime sales
  const yesterdayTotalResult = await OrderV2.findAll({
    where: {
      profileId: req.query.profileId,
      status: "COMPLETED",
    },
    include: [
      {
        model: CartProduct,
        include: [Menu],
      },
    ],
  });

  const totalResult = await OrderV2.findAll({
    where: {
      profileId: req.query.profileId,
      status: "COMPLETED",
    },
    include: [
      {
        model: CartProduct,
        include: [Menu],
      },
    ],
  });
  const lastMonthTotalResult = await OrderV2.findAll({
    where: {
      profileId: req.query.profileId,
      status: "COMPLETED",
      createdAt: { [Op.between]: [lastMonthStart, lastMonthEnd] },
    },
    include: [
      {
        model: CartProduct,
        include: [Menu],
      },
    ],
  });

  let lastMonthTodaySales = 0;
  let totalSales = 0;

  for (const order of lastMonthTotalResult) {
    for (const cartProduct of order.menu) {
      const menuPrice = parseFloat(cartProduct.menu.menu_price || 0);
      let extrasPrice = 0;
      try {
        const extras = JSON.parse(cartProduct.extras || "[]");
        extrasPrice = extras.reduce(
          (sum, item) => sum + parseFloat(item.price || 0),
          0
        );
      } catch (e) {
        console.warn("Invalid extras JSON:", cartProduct.extras);
      }
      lastMonthTodaySales += menuPrice + extrasPrice;
    }
  }

  for (const order of totalResult) {
    for (const cartProduct of order.menu) {
      const menuPrice = parseFloat(cartProduct.menu.menu_price || 0);
      let extrasPrice = 0;
      try {
        const extras = JSON.parse(cartProduct.extras || "[]");
        extrasPrice = extras.reduce(
          (sum, item) => sum + parseFloat(item.price || 0),
          0
        );
      } catch (e) {
        console.warn("Invalid extras JSON:", cartProduct.extras);
      }
      totalSales += menuPrice + extrasPrice;
    }
  }

  // Reviews
  const totalReviews = await Rating.count({
    where: { profileId: req.query.profileId },
  });
  const lastMonthReviews = await Rating.count({
    where: {
      profileId: req.query.profileId,
      createdAt: { [Op.between]: [lastMonthStart, lastMonthEnd] },
    },
  });

  const percentageChange = (current: number, previous: number) => {
    if (previous === 0) return { change: 100, good: true };
    const change = ((current - previous) / previous) * 100;
    return { change: Math.abs(change), good: change >= 0 };
  };
  return successResponse(res, "successful", {
    totalOrders: {
      value: totalOrders,
      ...percentageChange(totalOrders, lastMonthOrders),
    },
    completedOrders: {
      value: completedOrders,
      ...percentageChange(completedOrders, lastMonthCompletedOrders),
    },
    profileViews: {
      value: profileViews || 0,
      ...percentageChange(profileViews, lastMonthProfileViews),
    },
    totalProfileViews: {
      value: profileViews || 0,
    },
    todaySales: {
      value: parseFloat(todaySales),
      ...percentageChange(todaySales, yesterdayTodaySales),
    },
    totalSales: {
      value: totalSales || 0,
      ...percentageChange(totalSales, lastMonthTodaySales),
    },
    totalReviews: {
      value: totalReviews,
      ...percentageChange(totalReviews, lastMonthReviews),
    },
  });
};
