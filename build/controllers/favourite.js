"use strict";
// @ts-nocheck comment
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
exports.getDashboardStats = exports.search = exports.deleteFavourite = exports.getp = exports.postOrderV2 = exports.postOrder = exports.postFavourite = exports.notifyOrderV2 = exports.cancelOrderV2 = exports.confirmOrderV2 = exports.notifyOrder = exports.getOrderV2 = exports.getNotifications = exports.getOrder = exports.getTags = exports.getFavourite = void 0;
const utility_1 = require("../helpers/utility");
const LanLog_1 = require("../models/LanLog");
const Profile_1 = require("../models/Profile");
const date_fns_1 = require("date-fns");
const stripe_1 = __importDefault(require("stripe"));
const Users_1 = require("../models/Users");
const Menus_1 = require("../models/Menus");
const configSetup_1 = __importDefault(require("../config/configSetup"));
const SpecialTag_1 = require("../models/SpecialTag");
const Favourite_1 = require("../models/Favourite");
const sequelize_1 = require("sequelize");
const Order_1 = require("../models/Order");
const notification_1 = require("../services/notification");
const sms_1 = require("../services/sms");
const template_1 = require("../config/template");
const CartProduct_1 = require("../models/CartProduct");
const OrderV2_1 = require("../models/OrderV2");
const Rate_1 = require("../models/Rate");
const ProfileViews_1 = require("../models/ProfileViews");
const Notification_1 = require("../models/Notification");
const Alltags_1 = require("../models/Alltags");
const logger_1 = __importDefault(require("../services/logger"));
const cloudinary = require("cloudinary").v2;
const stripe = new stripe_1.default(configSetup_1.default.STRIPE_SK, {
    apiVersion: "2023-08-16",
});
const getFavourite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lan, log } = req.query;
    const favourite = yield Favourite_1.Favourite.findAll({
        include: [
            { model: Profile_1.Profile, include: [{ model: LanLog_1.LanLog }] },
            { model: Users_1.Users },
        ],
    });
    let vendor = [];
    for (let favouriteValue of favourite) {
        const distance = (0, utility_1.getDistanceFromLatLonInKm)(Number(favouriteValue.dataValues.profile.dataValues.lanlog.dataValues.Lan), Number(favouriteValue.dataValues.profile.dataValues.lanlog.dataValues.Log), Number(lan), Number(log));
        vendor.push(Object.assign(Object.assign({}, favouriteValue.dataValues), { distance }));
    }
    return (0, utility_1.successResponse)(res, "Fetched Successfully", vendor);
});
exports.getFavourite = getFavourite;
const getTags = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const specialized_tags = yield SpecialTag_1.SpecialTag.findAll();
    const all_tags = yield Alltags_1.AllTag.findAll();
    let tags = [];
    for (let value of all_tags) {
        if (specialized_tags.find((tag) => tag.tagId === value.id))
            continue;
        tags.push(value);
    }
    return (0, utility_1.successResponse)(res, "Fetched Successfully", tags);
});
exports.getTags = getTags;
const getOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const order = yield Order_1.Order.findAll({
        where: { userId: id },
        include: [
            { model: Profile_1.Profile, include: [{ model: LanLog_1.LanLog }] },
            { model: Users_1.Users },
            { model: Menus_1.Menu },
        ],
    });
    return (0, utility_1.successResponse)(res, "Fetched Successfully", order);
});
exports.getOrder = getOrder;
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const notification = yield Notification_1.Notification.findAll({
        where: { userId: id },
    });
    return (0, utility_1.successResponse)(res, "Fetched Successfully", notification);
});
exports.getNotifications = getNotifications;
const getOrderV2 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const order = yield OrderV2_1.OrderV2.findAll({
        where: { userId: id },
        include: [
            { model: Profile_1.Profile, include: [{ model: LanLog_1.LanLog }] },
            { model: Users_1.Users },
            { model: CartProduct_1.CartProduct, include: [{ model: Menus_1.Menu }] },
        ],
        order: [["createdAt", "DESC"]],
    });
    return (0, utility_1.successResponse)(res, "Fetched Successfully", order);
});
exports.getOrderV2 = getOrderV2;
const notifyOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, orderid } = req.query;
        const order = yield Order_1.Order.findOne({
            where: { id: orderid },
            include: [{ model: Profile_1.Profile }, { model: Menus_1.Menu }, { model: Users_1.Users }],
        });
        const userData = yield Users_1.Users.findOne({ where: { id: order === null || order === void 0 ? void 0 : order.userId } });
        if (!order)
            return (0, utility_1.errorResponse)(res, "Not Found");
        if (status == "PENDING") {
            yield Notification_1.Notification.create({
                title: `${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(),
                userId: order.profile.userId,
                description: `pick up your meal at ${order.profile.dataValues.business_name}`,
                type: Notification_1.NotificationType.ORDER
            });
            yield order.update({ status: "COMPLETED" });
            yield (0, notification_1.sendToken)(userData === null || userData === void 0 ? void 0 : userData.id, `${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(), `pick up your meal at ${order.profile.dataValues.business_name}`);
            yield (0, sms_1.sendEmailResend)(`${userData === null || userData === void 0 ? void 0 : userData.email}`, `${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(), (0, template_1.templateEmail)(`${userData.email}`, `pick up your meal at ${order.profile.dataValues.business_name}`));
            return (0, utility_1.successResponse)(res, "Fetched Successfully", order);
        }
        else {
            yield Notification_1.Notification.create({
                userId: order === null || order === void 0 ? void 0 : order.userId,
                title: `REMINDER: ${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(),
                description: `pick up your meal at ${order.profile.dataValues.business_name}`,
                type: Notification_1.NotificationType.ORDER
            });
            yield (0, notification_1.sendToken)(userData === null || userData === void 0 ? void 0 : userData.id, `REMINDER: ${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(), `pick up your meal at ${order.profile.dataValues.business_name}`);
            yield (0, sms_1.sendEmailResend)(`${userData.email}`, `REMINDER: ${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(), (0, template_1.templateEmail)(`${userData.email}`, `pick up your meal at ${order.profile.dataValues.business_name}`));
            return (0, utility_1.successResponse)(res, "Fetched Successfully", order);
        }
    }
    catch (error) {
        logger_1.default.error(error);
        return (0, utility_1.errorResponse)(res, "Error Processing Request");
    }
});
exports.notifyOrder = notifyOrder;
const confirmOrderV2 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderid, rate, comment } = req.body;
        const order = yield OrderV2_1.OrderV2.findOne({
            where: { id: orderid },
            include: [{ model: Profile_1.Profile }, { model: Users_1.Users }],
        });
        const userData = yield Users_1.Users.findOne({
            where: { id: order === null || order === void 0 ? void 0 : order.profile.userId },
        });
        const profile = yield Profile_1.Profile.findOne({ where: { id: order === null || order === void 0 ? void 0 : order.profileId } });
        if (!order)
            return (0, utility_1.errorResponse)(res, "No Found");
        if (!profile)
            return (0, utility_1.errorResponse)(res, "No Found");
        if (!userData)
            return (0, utility_1.errorResponse)(res, "No Found");
        if (order.status == "CONFIRM_COMPLETION") {
            yield order.update({ status: "COMPLETED" });
            yield Rate_1.Rating.create({
                profileId: order === null || order === void 0 ? void 0 : order.profileId,
                rate,
                comment,
                truckId: order === null || order === void 0 ? void 0 : order.profile.userId,
                userId: order.userId,
            });
            yield (profile === null || profile === void 0 ? void 0 : profile.update({
                totalRate: (order === null || order === void 0 ? void 0 : order.profile.totalRate) + 1,
                meanRate: (order === null || order === void 0 ? void 0 : order.profile.meanRate) + Number(rate),
                rate: ((order === null || order === void 0 ? void 0 : order.profile.meanRate) + Number(rate)) /
                    ((order === null || order === void 0 ? void 0 : order.profile.totalRate) + 1),
            }));
            yield Notification_1.Notification.create({
                userId: order === null || order === void 0 ? void 0 : order.profile.userId,
                title: `ORDER HAS BEEN CONFIRM`,
                description: `congratulations order has been confirmed by ${order.user.username}`,
                type: Notification_1.NotificationType.NORMAL
            });
            yield (0, notification_1.sendToken)(userData === null || userData === void 0 ? void 0 : userData.id, `ORDER HAS BEEN CONFIRM`, `congratulations order has been confirmed by ${order.user.username}`);
            yield (0, sms_1.sendEmailResend)(`${userData === null || userData === void 0 ? void 0 : userData.email}`, `ORDER HAS BEEN CONFIRM`, (0, template_1.templateEmail)(`${userData.email}`, `congratulations order has been confirmed by ${order.user.username}`));
            return (0, utility_1.successResponse)(res, "Fetched Successfully", order);
        }
        else {
            return (0, utility_1.successResponse)(res, "Fetched Successfully", order);
        }
    }
    catch (error) {
        logger_1.default.error(error);
        return (0, utility_1.errorResponse)(res, "Error Processing Request");
    }
});
exports.confirmOrderV2 = confirmOrderV2;
const cancelOrderV2 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderid, status } = req.body;
        const order = yield OrderV2_1.OrderV2.findOne({
            where: { id: orderid },
            include: [{ model: Profile_1.Profile }, { model: Users_1.Users }],
        });
        const userData = yield Users_1.Users.findOne({ where: { id: order === null || order === void 0 ? void 0 : order.userId } });
        if (!order)
            return (0, utility_1.errorResponse)(res, "No Found");
        if (status == "CANCELED") {
            yield order.update({ status: "CANCELED" });
            yield Notification_1.Notification.create({
                userId: order === null || order === void 0 ? void 0 : order.userId,
                title: `YOUR ORDER HAS BEEN CANCELED`,
                description: `unfortunately your order has been canceled by ${order.profile.dataValues.business_name}`,
                type: Notification_1.NotificationType.ORDER
            });
            yield (0, notification_1.sendToken)(userData === null || userData === void 0 ? void 0 : userData.id, `YOUR ORDER HAS BEEN CANCELED`, `unfortunately your order has been canceled by ${order.profile.dataValues.business_name}`);
            yield (0, sms_1.sendEmailResend)(`${userData === null || userData === void 0 ? void 0 : userData.email}`, `YOUR ORDER HAS BEEN CANCELED`, (0, template_1.templateEmail)(`${userData.email}`, `unfortunately your order has been canceled by ${order.profile.dataValues.business_name}`));
            return (0, utility_1.successResponse)(res, "Fetched Successfully", order);
        }
        else {
            return (0, utility_1.successResponse)(res, "Fetched Successfully", order);
        }
    }
    catch (error) {
        logger_1.default.error(error);
        return (0, utility_1.errorResponse)(res, "Error Processing Request");
    }
});
exports.cancelOrderV2 = cancelOrderV2;
const notifyOrderV2 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, orderid } = req.body;
        const order = yield OrderV2_1.OrderV2.findOne({
            where: { id: orderid },
            include: [
                { model: Profile_1.Profile },
                //     { model: Menu },
                { model: Users_1.Users },
            ],
        });
        const userData = yield Users_1.Users.findOne({ where: { id: order === null || order === void 0 ? void 0 : order.userId } });
        if (!order)
            return (0, utility_1.errorResponse)(res, "No Found");
        if (status == "PROCESSING") {
            yield order.update({ status: "CONFIRM_COMPLETION" });
            yield Notification_1.Notification.create({
                userId: order === null || order === void 0 ? void 0 : order.userId,
                title: `YOUR ORDER IS READY FOR PICKUP`.toUpperCase(),
                description: `pick up your meal at ${order.profile.dataValues.business_name}`,
                type: Notification_1.NotificationType.ORDER
            });
            yield (0, notification_1.sendToken)(userData === null || userData === void 0 ? void 0 : userData.id, `YOUR ORDER IS READY FOR PICKUP`.toUpperCase(), `pick up your meal at ${order.profile.dataValues.business_name}`);
            yield (0, sms_1.sendEmailResend)(`${userData === null || userData === void 0 ? void 0 : userData.email}`, `YOUR ORDER IS READY FOR PICKUP`.toUpperCase(), (0, template_1.templateEmail)(`${userData.email}`, `pick up your meal at ${order.profile.dataValues.business_name}`));
            return (0, utility_1.successResponse)(res, "Fetched Successfully", order);
        }
        else if (status == "PENDING") {
            yield Notification_1.Notification.create({
                userId: order === null || order === void 0 ? void 0 : order.userId,
                title: `Payment Received by ${order.profile.dataValues.business_name}: YOUR ORDER IS CURRENTLY BEING PROCESSED`,
                description: `your meal will be ready soon`,
                type: Notification_1.NotificationType.ORDER
            });
            yield order.update({ status: "PROCESSING" });
            yield (0, notification_1.sendToken)(userData === null || userData === void 0 ? void 0 : userData.id, `Payment Received by ${order.profile.dataValues.business_name}: YOUR ORDER IS CURRENTLY BEING PROCESSED`, `your meal will be ready soon`);
            yield (0, sms_1.sendEmailResend)(`${userData === null || userData === void 0 ? void 0 : userData.email}`, `Payment Received by ${order.profile.dataValues.business_name}: YOUR ORDER IS CURRENTLY BEING PROCESSED`, (0, template_1.templateEmail)(`${userData.email}`, `your meal will be ready soon`));
            return (0, utility_1.successResponse)(res, "Fetched Successfully", order);
        }
        else if (status == "CONFIRM_COMPLETION" || status == "COMPLETED") {
            yield Notification_1.Notification.create({
                userId: order === null || order === void 0 ? void 0 : order.userId,
                title: `REMINDER: YOUR ORDER IS READY FOR PICKUP`.toUpperCase(),
                description: `pick up your meal at ${order.profile.dataValues.business_name}`,
                type: Notification_1.NotificationType.ORDER
            });
            yield (0, notification_1.sendToken)(userData === null || userData === void 0 ? void 0 : userData.id, `REMINDER: YOUR ORDER IS READY FOR PICKUP`.toUpperCase(), `pick up your meal at ${order.profile.dataValues.business_name}`);
            yield (0, sms_1.sendEmailResend)(`${userData.email}`, `REMINDER: YOUR ORDER IS READY FOR PICKUP`.toUpperCase(), (0, template_1.templateEmail)(`${userData.email}`, `pick up your meal at ${order.profile.dataValues.business_name}`));
            return (0, utility_1.successResponse)(res, "Fetched Successfully", order);
        }
    }
    catch (error) {
        logger_1.default.error(error);
        return (0, utility_1.errorResponse)(res, "Error Processing Request");
    }
});
exports.notifyOrderV2 = notifyOrderV2;
const postFavourite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { profileId } = req.body;
    let { id } = req.user;
    const user = yield Users_1.Users.findOne({ where: { id } });
    const profile = yield Profile_1.Profile.findOne({ where: { id: profileId } });
    const truckUser = yield Users_1.Users.findOne({ where: { id: profile === null || profile === void 0 ? void 0 : profile.userId } });
    const fav = yield Favourite_1.Favourite.findOne({ where: { profileId, userId: id } });
    if (fav)
        return (0, utility_1.errorResponse)(res, "Vendor Already Added");
    const createFavourite = yield Favourite_1.Favourite.create({ profileId, userId: id });
    const favourite = yield Favourite_1.Favourite.findOne({
        where: {
            id: createFavourite.id,
        },
        include: [
            { model: Profile_1.Profile, include: [{ model: LanLog_1.LanLog }] },
            { model: Users_1.Users },
        ],
    });
    yield Notification_1.Notification.create({
        userId: truckUser === null || truckUser === void 0 ? void 0 : truckUser.id,
        title: `Foodtruck.express`.toUpperCase(),
        description: `Hey ${profile === null || profile === void 0 ? void 0 : profile.business_name}, Customers are adding your truck to their favorites list on foodtruck.express, subscribe to get more attention.`,
        type: Notification_1.NotificationType.NORMAL
    });
    (0, notification_1.sendToken)(truckUser === null || truckUser === void 0 ? void 0 : truckUser.id, `Foodtruck.express`.toUpperCase(), `Hey ${profile === null || profile === void 0 ? void 0 : profile.business_name}, Customers are adding your truck to their favorites list on foodtruck.express, subscribe to get more attention.`);
    return (0, utility_1.successResponse)(res, "Added Successfully", favourite);
});
exports.postFavourite = postFavourite;
const postOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { profileId, menuId, extras } = req.body;
        let { id } = req.user;
        let profile = yield Profile_1.Profile.findOne({ where: { id: profileId } });
        let user = yield Users_1.Users.findOne({ where: { id: profile === null || profile === void 0 ? void 0 : profile.userId } });
        yield Notification_1.Notification.create({
            userId: user === null || user === void 0 ? void 0 : user.id,
            title: `Foodtruck.express`.toUpperCase(),
            description: "You have recieved an order, please process the pending order.",
            type: Notification_1.NotificationType.ORDER
        });
        (0, notification_1.sendToken)(user === null || user === void 0 ? void 0 : user.id, `Foodtruck.express`.toUpperCase(), "You have recieved an order, please process the pending order.");
        (0, sms_1.sendEmailResend)(`${user === null || user === void 0 ? void 0 : user.email}`, "Foodtruck.express".toUpperCase(), (0, template_1.templateEmail)(`${user === null || user === void 0 ? void 0 : user.email}`, "You have recieved an order, please process the pending order."));
        const order = yield Order_1.Order.create({
            profileId: profileId,
            userId: id,
            menuId,
            extras: extras,
        });
        return (0, utility_1.successResponse)(res, "Order Added Successfully");
    }
    catch (error) {
        logger_1.default.error(error);
        return (0, utility_1.errorResponse)(res, "Error Processing Request");
    }
});
exports.postOrder = postOrder;
const postOrderV2 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const tempMenu = [];
        const order = yield OrderV2_1.OrderV2.create({
            profileId: profileId,
            userId: id,
            phone,
            note,
            total,
        });
        for (var value of menus) {
            tempMenu.push(Object.assign({ userId: id, order: order.id }, value));
        }
        yield CartProduct_1.CartProduct.bulkCreate(tempMenu);
        const profile = yield Profile_1.Profile.findOne({ where: { id: profileId } });
        const user = yield Users_1.Users.findOne({ where: { id: profile === null || profile === void 0 ? void 0 : profile.userId } });
        yield Notification_1.Notification.create({
            userId: user === null || user === void 0 ? void 0 : user.id,
            title: `Foodtruck.express`.toUpperCase(),
            description: "You have recieved an order, please process the pending order.",
            type: Notification_1.NotificationType.NORMAL
        });
        (0, notification_1.sendToken)(user === null || user === void 0 ? void 0 : user.id, `Foodtruck.express`.toUpperCase(), "You have recieved an order, please process the pending order.");
        (0, sms_1.sendEmailResend)(`${user === null || user === void 0 ? void 0 : user.email}`, "Foodtruck.express".toUpperCase(), (0, template_1.templateEmail)(`${user === null || user === void 0 ? void 0 : user.email}`, "You have recieved an order, please process the pending order."));
        console.log(`${user === null || user === void 0 ? void 0 : user.email}`);
        return (0, utility_1.successResponse)(res, "Order Added Successfully");
    }
    catch (error) {
        logger_1.default.error(error);
        return (0, utility_1.errorResponse)(res, "Error Processing Request");
    }
});
exports.postOrderV2 = postOrderV2;
const getp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield Profile_1.Profile.findAll({});
    return res
        .status(200)
        .send({ message: "Vendor Added Successfully", profile, status: true });
});
exports.getp = getp;
const deleteFavourite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id } = req.body;
    const favourite = yield Favourite_1.Favourite.findOne({ where: { id } });
    yield (favourite === null || favourite === void 0 ? void 0 : favourite.destroy());
    return res
        .status(200)
        .send({ message: "Deleted Successfully", status: true });
});
exports.deleteFavourite = deleteFavourite;
const search = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { value, lan, log } = req.query;
    value = value === null || value === void 0 ? void 0 : value.toString().replace("+", " ");
    let valueSearch = {};
    if (value && value != "") {
        valueSearch = {
            [sequelize_1.Op.or]: [
                { business_name: { [sequelize_1.Op.like]: "%" + value + "%" } },
                { tag: { [sequelize_1.Op.like]: "%" + value + "%" } },
                { unique_detail: { [sequelize_1.Op.like]: "%" + value + "%" } },
                { detail: { [sequelize_1.Op.like]: "%" + value + "%" } },
            ],
        };
    }
    const vendors = yield Profile_1.Profile.findAll({
        where: Object.assign({}, valueSearch),
        include: [{ model: Users_1.Users }, { model: LanLog_1.LanLog }],
    });
    let vendor = [];
    for (let vendorValue of vendors) {
        const distance = (0, utility_1.getDistanceFromLatLonInKm)(Number(vendorValue.dataValues.lanlog.dataValues.Lan), Number(vendorValue.dataValues.lanlog.dataValues.Log), Number(lan), Number(log));
        if (distance <= Number(15)) {
            if (vendorValue.dataValues.user.dataValues.type == Users_1.UserType.VENDOR) {
                vendor.push(vendorValue.dataValues);
            }
        }
    }
    (0, utility_1.successResponse)(res, "Successful", vendor);
});
exports.search = search;
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    const startToday = (0, date_fns_1.startOfDay)(today);
    const endToday = (0, date_fns_1.endOfDay)(today);
    const lastMonthStart = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(today, 1));
    const lastMonthEnd = (0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(today, 1));
    const thisMonthStart = (0, date_fns_1.startOfMonth)(today);
    const thisMonthEnd = (0, date_fns_1.endOfMonth)(today);
    // Total orders
    const totalOrders = yield OrderV2_1.OrderV2.count({
        where: { profileId: req.query.profileId },
    });
    const lastMonthOrders = yield OrderV2_1.OrderV2.count({
        where: {
            profileId: req.query.profileId,
            createdAt: { [sequelize_1.Op.between]: [lastMonthStart, lastMonthEnd] },
        },
    });
    // Completed orders
    const completedOrders = yield OrderV2_1.OrderV2.count({
        where: { status: "COMPLETED", profileId: req.query.profileId },
    });
    const lastMonthCompletedOrders = yield OrderV2_1.OrderV2.count({
        where: {
            status: "COMPLETED",
            profileId: req.query.profileId,
            createdAt: { [sequelize_1.Op.between]: [lastMonthStart, lastMonthEnd] },
        },
    });
    // Completed orders
    const profileViews = yield ProfileViews_1.ProfileViews.count({
        where: { profileId: req.query.profileId },
    });
    const lastMonthProfileViews = yield ProfileViews_1.ProfileViews.count({
        where: {
            profileId: req.query.profileId,
            createdAt: { [sequelize_1.Op.between]: [lastMonthStart, lastMonthEnd] },
        },
    });
    // Today sales
    const todayStart = (0, date_fns_1.startOfDay)(new Date());
    const todayEnd = (0, date_fns_1.endOfDay)(new Date());
    const todayResult = yield OrderV2_1.OrderV2.findAll({
        where: {
            profileId: req.query.profileId,
            status: "COMPLETED",
            createdAt: {
                [sequelize_1.Op.between]: [todayStart, todayEnd],
            },
        },
        include: [
            {
                model: CartProduct_1.CartProduct,
                include: [Menus_1.Menu],
            },
        ],
    });
    // Get the current date
    const now = new Date();
    // Get start of yesterday
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    // Get end of yesterday
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
    const yesterdayResult = yield OrderV2_1.OrderV2.findAll({
        where: {
            profileId: req.query.profileId,
            status: "COMPLETED",
            createdAt: {
                [sequelize_1.Op.between]: [startOfYesterday, endOfYesterday],
            },
        },
        include: [
            {
                model: CartProduct_1.CartProduct,
                include: [Menus_1.Menu],
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
                extrasPrice = extras.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
            }
            catch (e) {
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
                extrasPrice = extras.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
            }
            catch (e) {
                console.warn("Invalid extras JSON:", cartProduct.extras);
            }
            todaySales += menuPrice + extrasPrice;
        }
    }
    // Lifetime sales
    const yesterdayTotalResult = yield OrderV2_1.OrderV2.findAll({
        where: {
            profileId: req.query.profileId,
            status: "COMPLETED",
        },
        include: [
            {
                model: CartProduct_1.CartProduct,
                include: [Menus_1.Menu],
            },
        ],
    });
    const totalResult = yield OrderV2_1.OrderV2.findAll({
        where: {
            profileId: req.query.profileId,
            status: "COMPLETED",
        },
        include: [
            {
                model: CartProduct_1.CartProduct,
                include: [Menus_1.Menu],
            },
        ],
    });
    const lastMonthTotalResult = yield OrderV2_1.OrderV2.findAll({
        where: {
            profileId: req.query.profileId,
            status: "COMPLETED",
            createdAt: { [sequelize_1.Op.between]: [lastMonthStart, lastMonthEnd] },
        },
        include: [
            {
                model: CartProduct_1.CartProduct,
                include: [Menus_1.Menu],
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
                extrasPrice = extras.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
            }
            catch (e) {
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
                extrasPrice = extras.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
            }
            catch (e) {
                console.warn("Invalid extras JSON:", cartProduct.extras);
            }
            totalSales += menuPrice + extrasPrice;
        }
    }
    // Reviews
    const totalReviews = yield Rate_1.Rating.count({
        where: { profileId: req.query.profileId },
    });
    const lastMonthReviews = yield Rate_1.Rating.count({
        where: {
            profileId: req.query.profileId,
            createdAt: { [sequelize_1.Op.between]: [lastMonthStart, lastMonthEnd] },
        },
    });
    const percentageChange = (current, previous) => {
        if (previous === 0)
            return { change: 100, good: true };
        const change = ((current - previous) / previous) * 100;
        return { change: Math.abs(change), good: change >= 0 };
    };
    return (0, utility_1.successResponse)(res, "successful", {
        totalOrders: Object.assign({ value: totalOrders }, percentageChange(totalOrders, lastMonthOrders)),
        completedOrders: Object.assign({ value: completedOrders }, percentageChange(completedOrders, lastMonthCompletedOrders)),
        profileViews: Object.assign({ value: profileViews || 0 }, percentageChange(profileViews, lastMonthProfileViews)),
        totalProfileViews: {
            value: profileViews || 0,
        },
        todaySales: Object.assign({ value: parseFloat(todaySales) }, percentageChange(todaySales, yesterdayTodaySales)),
        totalSales: Object.assign({ value: totalSales || 0 }, percentageChange(totalSales, lastMonthTodaySales)),
        totalReviews: Object.assign({ value: totalReviews }, percentageChange(totalReviews, lastMonthReviews)),
    });
});
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=favourite.js.map