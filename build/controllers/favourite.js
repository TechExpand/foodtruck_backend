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
exports.search = exports.deleteFavourite = exports.getp = exports.postOrder = exports.postFavourite = exports.notifyOrder = exports.getOrder = exports.getFavourite = void 0;
const utility_1 = require("../helpers/utility");
const LanLog_1 = require("../models/LanLog");
const Profile_1 = require("../models/Profile");
const stripe_1 = __importDefault(require("stripe"));
const Users_1 = require("../models/Users");
const Menus_1 = require("../models/Menus");
const Favourite_1 = require("../models/Favourite");
const sequelize_1 = require("sequelize");
const Order_1 = require("../models/Order");
const notification_1 = require("../services/notification");
const sms_1 = require("../services/sms");
const template_1 = require("../config/template");
const cloudinary = require("cloudinary").v2;
const stripe = new stripe_1.default('sk_test_51HGpOPE84s4AdL4O3gsrsEu4BXpPqDpWvlRAwPA30reXQ6UKhOzlUluJaYKiDDh6g9A0xYJbeCh9rM0RnlQov2lW00ZyOHxrx1', {
    apiVersion: '2023-08-16',
});
const getFavourite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const favourite = yield Favourite_1.Favourite.findAll({
        include: [
            { model: Profile_1.Profile, include: [{ model: LanLog_1.LanLog }] },
            { model: Users_1.Users },
        ]
    });
    return res.status(200).send({ message: "Fetched Successfully", favourite });
});
exports.getFavourite = getFavourite;
const getOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const order = yield Order_1.Order.findAll({
        where: { userId: id },
        include: [
            { model: Profile_1.Profile, include: [{ model: LanLog_1.LanLog }] },
            { model: Users_1.Users },
            { model: Menus_1.Menu },
        ]
    });
    return res.status(200).send({ message: "Fetched Successfully", order });
});
exports.getOrder = getOrder;
const notifyOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status, orderid } = req.query;
    const order = yield Order_1.Order.findOne({
        where: { id: orderid },
        include: [
            { model: Profile_1.Profile },
            { model: Menus_1.Menu },
            { model: Users_1.Users },
        ]
    });
    const userData = yield Users_1.Users.findOne({ where: { id: order === null || order === void 0 ? void 0 : order.userId } });
    if (!order)
        return res.status(200).send({ message: "Not Found", order });
    if (status == "PENDING") {
        yield order.update({ status: "COMPLETED" });
        yield (0, notification_1.sendToken)(userData === null || userData === void 0 ? void 0 : userData.fcmToken, `${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(), `pick up your meal at ${order.profile.dataValues.business_name}`);
        yield (0, sms_1.sendEmailResend)(`${userData === null || userData === void 0 ? void 0 : userData.email}`, `${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(), (0, template_1.templateEmail)(`${userData.email}`, `pick up your meal at ${order.profile.dataValues.business_name}`));
        return res.status(200).send({ message: "Fetched Successfully", order });
    }
    else {
        yield (0, notification_1.sendToken)(userData === null || userData === void 0 ? void 0 : userData.fcmToken, `REMINDER: ${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(), `pick up your meal at ${order.profile.dataValues.business_name}`);
        yield (0, sms_1.sendEmailResend)(`${userData.email}`, `REMINDER: ${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(), (0, template_1.templateEmail)(`${userData.email}`, `pick up your meal at ${order.profile.dataValues.business_name}`));
        return res.status(200).send({ message: "Fetched Successfully", order });
    }
});
exports.notifyOrder = notifyOrder;
const postFavourite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { profileId } = req.body;
    let { id } = req.user;
    const user = yield Users_1.Users.findOne({ where: { id } });
    const profile = yield Profile_1.Profile.findOne({ where: { id: profileId } });
    const truckUser = yield Users_1.Users.findOne({ where: { id: profile === null || profile === void 0 ? void 0 : profile.userId } });
    const fav = yield Favourite_1.Favourite.findOne({ where: { profileId, userId: id } });
    if (fav)
        return res.status(200).send({ message: "Vendor Added Successfully", status: true });
    const favourite = yield Favourite_1.Favourite.create({ profileId, userId: id });
    (0, notification_1.sendToken)(truckUser === null || truckUser === void 0 ? void 0 : truckUser.id, `Foodtruck.express`.toUpperCase(), `Hey ${profile === null || profile === void 0 ? void 0 : profile.business_name}, Customers are adding your truck to their favourite on foodtruck.express, subscribe to get more attention.`);
    (0, sms_1.sendEmailResend)(`${truckUser === null || truckUser === void 0 ? void 0 : truckUser.email}`, "Foodtruck.express".toUpperCase(), (0, template_1.templateEmail)(`${user === null || user === void 0 ? void 0 : user.email}`, `Hey ${profile === null || profile === void 0 ? void 0 : profile.business_name}, Customers are adding your truck to their favourite on foodtruck.express, subscribe to get more attention.`));
    return res.status(200).send({ message: "Vendor Added Successfully", favourite, status: true });
});
exports.postFavourite = postFavourite;
const postOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { profileId, menuId, extras } = req.body;
    let { id } = req.user;
    let profile = yield Profile_1.Profile.findOne({ where: { id: profileId } });
    let user = yield Users_1.Users.findOne({ where: { id: profile === null || profile === void 0 ? void 0 : profile.userId } });
    (0, notification_1.sendToken)(user === null || user === void 0 ? void 0 : user.fcmToken, `Foodtruck.express`.toUpperCase(), "You have recieved an order, please process the pending order.");
    (0, sms_1.sendEmailResend)(`${user === null || user === void 0 ? void 0 : user.email}`, "Foodtruck.express".toUpperCase(), (0, template_1.templateEmail)(`${user === null || user === void 0 ? void 0 : user.email}`, "You have recieved an order, please process the pending order."));
    const order = yield Order_1.Order.create({ profileId: profileId, userId: id, menuId, extras: extras });
    return res.status(200).send({ message: "Order Added Successfully", order, status: true });
});
exports.postOrder = postOrder;
const getp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield Profile_1.Profile.findAll({});
    return res.status(200).send({ message: "Vendor Added Successfully", profile, status: true });
});
exports.getp = getp;
const deleteFavourite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id } = req.body;
    const favourite = yield Favourite_1.Favourite.findOne({ where: { id } });
    yield (favourite === null || favourite === void 0 ? void 0 : favourite.destroy());
    return res.status(200).send({ message: "Deleted Successfully", status: true });
});
exports.deleteFavourite = deleteFavourite;
const search = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { value, lan, log } = req.query;
    value = value === null || value === void 0 ? void 0 : value.toString().replace("+", " ");
    let valueSearch = {};
    if (value && value != "") {
        valueSearch =
            {
                [sequelize_1.Op.or]: [
                    { 'business_name': { [sequelize_1.Op.like]: '%' + value + '%' } },
                    { 'tag': { [sequelize_1.Op.like]: '%' + value + '%' } },
                    { 'unique_detail': { [sequelize_1.Op.like]: '%' + value + '%' } },
                    { 'detail': { [sequelize_1.Op.like]: '%' + value + '%' } },
                ]
            };
    }
    const vendors = yield Profile_1.Profile.findAll({
        where: Object.assign({}, valueSearch), include: [
            { model: Users_1.Users }, { model: LanLog_1.LanLog }
        ]
    });
    let vendor = [];
    for (let vendorValue of vendors) {
        const distance = (0, utility_1.getDistanceFromLatLonInKm)(Number(vendorValue.dataValues.lanlog.dataValues.Lan), Number(vendorValue.dataValues.lanlog.dataValues.Log), Number(lan), Number(log));
        if (distance <= Number(500)) {
            if (vendorValue.dataValues.user.dataValues.type == Users_1.UserType.VENDOR) {
                vendor.push(vendorValue.dataValues);
            }
        }
    }
    (0, utility_1.successResponse)(res, "Successful", vendor);
});
exports.search = search;
//# sourceMappingURL=favourite.js.map