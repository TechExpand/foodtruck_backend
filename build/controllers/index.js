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
exports.createEvent = exports.sendTestEmailCon = exports.deleteEvent = exports.getEvent = exports.updateEvent = exports.updateMenu = exports.createMenu = exports.deleteMenu = exports.getHomeDetails = exports.getMenu = exports.vendorEvent = exports.vendorMenu = exports.fetchRate = exports.rateProfile = exports.updateLanLog = exports.getLanLog = exports.getSubscription = exports.getVendorProfile = exports.getAllTags = exports.deleteUser = exports.getUser = exports.getTags = exports.getFirstFivePorpular = exports.filterVendorBytag = exports.getVendorEvent = exports.getFirstFiveEvents = exports.getProfile = exports.onlineLanlogUser = exports.onlineLanlogVendors = exports.addNewCard = exports.reactivateSubscription = exports.cancelSubscription = exports.createSubscription = exports.updateProfile = exports.updateToken = exports.createProfile = exports.createLocation = exports.apiIndex = void 0;
const utility_1 = require("../helpers/utility");
const LanLog_1 = require("../models/LanLog");
const Profile_1 = require("../models/Profile");
const stripe_1 = __importDefault(require("stripe"));
const configSetup_1 = __importDefault(require("../config/configSetup"));
const Users_1 = require("../models/Users");
const Menus_1 = require("../models/Menus");
const Event_1 = require("../models/Event");
const Popular_1 = require("../models/Popular");
const Tag_1 = require("../models/Tag");
const HomeTag_1 = require("../models/HomeTag");
const Alltags_1 = require("../models/Alltags");
const sequelize_1 = require("sequelize");
const Order_1 = require("../models/Order");
const Extras_1 = require("../models/Extras");
const sms_1 = require("../services/sms");
const template_1 = require("../config/template");
const notification_1 = require("../services/notification");
const Rate_1 = require("../models/Rate");
const cloudinary = require("cloudinary").v2;
const stripe = new stripe_1.default(configSetup_1.default.STRIPE_SK, {
    apiVersion: '2023-08-16',
});
const apiIndex = (req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, utility_1.successResponse)(res, 'API Working!'); });
exports.apiIndex = apiIndex;
const createLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { Lan, Log, online } = req.body;
    let { id } = req.user;
    const user = yield Users_1.Users.findOne({ where: { id } });
    const lanlog = yield LanLog_1.LanLog.findOne({ where: { userId: id } });
    if (lanlog) {
        yield lanlog.update({ Lan, Log, type: user === null || user === void 0 ? void 0 : user.type });
        return res.status(200).send({ message: "Created Successfully", status: true });
    }
    else {
        const location = yield LanLog_1.LanLog.create({ Lan, Log, online, userId: id, type: user === null || user === void 0 ? void 0 : user.type });
        return res.status(200).send({ message: "Created Successfully", status: true });
    }
});
exports.createLocation = createLocation;
const createProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { business_name, unique_detail, detail, phone, tag } = req.body;
    let { id } = req.user;
    if (req.file) {
        const result = yield cloudinary.uploader.upload(req.file.path.replace(/ /g, "_"));
        const user = yield Users_1.Users.findOne({ where: { id } });
        const location = yield LanLog_1.LanLog.findOne({ where: { userId: id } });
        const profile = yield Profile_1.Profile.create({
            business_name, unique_detail, detail,
            phone, lanlogId: location.id, userId: id,
            pro_pic: result.secure_url, tag,
        });
        return res.status(200).send({ message: "Created Successfully", status: true });
    }
    return res.status(400).send({ message: "File is required", status: false });
});
exports.createProfile = createProfile;
const updateToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id } = req.user;
    let { fcmToken } = req.body;
    const user = yield Users_1.Users.findOne({ where: { id } });
    yield (user === null || user === void 0 ? void 0 : user.update({ fcmToken }));
    return res.status(200).send({ message: "Updated Successfully", status: true });
});
exports.updateToken = updateToken;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { business_name, unique_detail, detail, phone, tag } = req.body;
    let { id } = req.user;
    if (req.file) {
        const result = yield cloudinary.uploader.upload(req.file.path.replace(/ /g, "_"));
        const location = yield LanLog_1.LanLog.findOne({ where: { userId: id } });
        const profile = yield Profile_1.Profile.findOne({ where: { userId: id } });
        yield (profile === null || profile === void 0 ? void 0 : profile.update({
            business_name: business_name !== null && business_name !== void 0 ? business_name : profile.business_name,
            unique_detail: unique_detail !== null && unique_detail !== void 0 ? unique_detail : profile.unique_detail, detail: detail !== null && detail !== void 0 ? detail : profile.detail,
            phone: phone !== null && phone !== void 0 ? phone : profile.phone, lanlogId: location.id, userId: id,
            pro_pic: result.secure_url,
            tag: tag !== null && tag !== void 0 ? tag : profile.tag
        }));
        return res.status(200).send({ message: "Updated Successfully", status: true });
    }
    else {
        const location = yield LanLog_1.LanLog.findOne({ where: { userId: id } });
        const profile = yield Profile_1.Profile.findOne({ where: { userId: id } });
        yield (profile === null || profile === void 0 ? void 0 : profile.update({
            business_name: business_name !== null && business_name !== void 0 ? business_name : profile.business_name,
            unique_detail: unique_detail !== null && unique_detail !== void 0 ? unique_detail : profile.unique_detail, detail: detail !== null && detail !== void 0 ? detail : profile.detail,
            phone: phone !== null && phone !== void 0 ? phone : profile.phone, lanlogId: location.id, userId: id,
            pro_pic: profile.pro_pic,
            tag: tag !== null && tag !== void 0 ? tag : profile.tag
        }));
        return res.status(200).send({ message: "Updated Successfully", status: true });
    }
});
exports.updateProfile = updateProfile;
const createSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { paymentMethod } = req.query;
    // console.log(`${card_number}, ${exp_month}, ${exp_year}, ${cvc}`)
    let { id } = req.user;
    try {
        const user = yield Users_1.Users.findOne({ where: { id } });
        const profile = yield Profile_1.Profile.findOne({ where: { userId: user === null || user === void 0 ? void 0 : user.id } });
        const customer = yield stripe.customers.create({
            email: user.email,
            payment_method: paymentMethod,
            invoice_settings: {
                default_payment_method: paymentMethod,
            }
        });
        console.log(customer.id);
        const subscription = yield stripe.subscriptions.create({
            customer: String(customer.id),
            items: [
                {
                    'price': configSetup_1.default.PRICE_ID,
                    'quantity': 1,
                },
            ],
            default_payment_method: paymentMethod,
            payment_settings: {
                payment_method_options: {
                    card: {
                        request_three_d_secure: 'any',
                    },
                },
                payment_method_types: ['card'],
                save_default_payment_method: 'on_subscription',
            },
            expand: ['latest_invoice.payment_intent'],
            trial_period_days: 1
        });
        yield (user === null || user === void 0 ? void 0 : user.update({
            customer_id: customer.id,
            subscription_id: subscription.id
        }));
        yield (profile === null || profile === void 0 ? void 0 : profile.update({ subcription_id: subscription.id }));
        if (subscription.latest_invoice.payment_intent) {
            return res.status(200).send({
                message: "Created Successfully",
                clientSecret: subscription.latest_invoice.payment_intent.client_secret,
                subscriptionId: subscription.id,
                status: true
            });
        }
        else {
            return res.status(200).send({
                message: "Created Successfully",
                subscriptionId: subscription.id,
                status: true
            });
        }
    }
    catch (e) {
        console.log(e.message);
        return res.status(400).send({
            message: e.message,
            status: false
        });
    }
});
exports.createSubscription = createSubscription;
const cancelSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id } = req.user;
    const user = yield Users_1.Users.findOne({ where: { id } });
    const subscription = yield stripe.subscriptions.cancel(user.subscription_id);
    const status = yield stripe.subscriptions.retrieve(user.subscription_id);
    return res.status(200).send({ message: "Canceled Successfully", status: status.status });
});
exports.cancelSubscription = cancelSubscription;
const reactivateSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id } = req.user;
    const user = yield Users_1.Users.findOne({ where: { id } });
    const subscription = yield stripe.subscriptions.resume(user.subscription_id);
    return res.status(200).send({ message: "You have subscribed to foodtruck.express plan", status: true });
});
exports.reactivateSubscription = reactivateSubscription;
const addNewCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let { card_number, expiry_month, expiry_year, cvc } = req.query;
    let { id } = req.user;
    const user = yield Users_1.Users.findOne({ where: { id } });
    const profile = yield Profile_1.Profile.findOne({ where: { userId: user === null || user === void 0 ? void 0 : user.id } });
    const paymentMethod = yield stripe.paymentMethods.create({
        type: 'card',
        card: {
            number: String(card_number),
            exp_month: exp_month,
            exp_year: exp_year,
            cvc: String(cvc),
        },
    });
    yield stripe.paymentMethods.attach(paymentMethod.id, { customer: user.customer_id });
    yield (user === null || user === void 0 ? void 0 : user.update({ token_id: token.id, card_id: (_a = token.card) === null || _a === void 0 ? void 0 : _a.id }));
    return res.status(200).send({ message: "Created Successfully", status: true });
});
exports.addNewCard = addNewCard;
const onlineLanlogVendors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lan, log, range_value } = req.query;
    let distance_list = [];
    const lanlog = yield LanLog_1.LanLog.findAll({
        where: {
            type: Users_1.UserType.VENDOR
        },
        include: [{
                model: Users_1.Users,
                where: {
                    type: Users_1.UserType.VENDOR
                },
                attributes: [
                    'createdAt', 'updatedAt', "email", 'type'
                ]
            }
        ],
    });
    for (let vendor of lanlog) {
        const distance = (0, utility_1.getDistanceFromLatLonInKm)(Number(vendor.Lan), Number(vendor.Log), Number(lan), Number(log));
        // 500
        if (distance <= Number(15)) {
            if (vendor.dataValues.user.dataValues.type == Users_1.UserType.VENDOR) {
                distance_list.push(Object.assign(Object.assign({}, vendor.dataValues), { user: vendor.dataValues.user.dataValues, distance }));
                distance_list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
            }
        }
    }
    return res.status(200).send({ message: "Fetched Successfully", vendors: distance_list });
});
exports.onlineLanlogVendors = onlineLanlogVendors;
const onlineLanlogUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lan, log, range_value } = req.query;
    const { id } = req.user;
    const user = yield Users_1.Users.findOne({ where: { id } });
    try {
        const subscription = yield stripe.subscriptions.retrieve(user === null || user === void 0 ? void 0 : user.subscription_id);
        if (subscription.status == 'active' || subscription.status == 'trialing') {
            let distance_list = [];
            const lanlog = yield LanLog_1.LanLog.findAll({
                where: {
                    type: Users_1.UserType.USER
                },
                include: [{
                        model: Users_1.Users,
                        where: {
                            type: Users_1.UserType.USER
                        },
                        attributes: [
                            'createdAt', 'updatedAt', "email", "type"
                        ]
                    }
                ],
            });
            for (let user of lanlog) {
                const distance = (0, utility_1.getDistanceFromLatLonInKm)(Number(user.Lan), Number(user.Log), Number(lan), Number(log));
                if (distance <= Number(15)) {
                    if (user.dataValues.user.dataValues.type == Users_1.UserType.USER) {
                        distance_list.push(Object.assign(Object.assign({}, user.dataValues), { user: user.dataValues.user.dataValues, distance }));
                        distance_list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
                    }
                }
            }
            return res.status(200).send({ message: "Fetched Successfully", users: distance_list });
        }
        else {
            return res.status(200).send({ message: "Fetched Successfully", users: "Subscribe to view online User locations and Display your Menu on your profile" });
        }
    }
    catch (e) {
        return res.status(200).send({ message: "Fetched Successfully", users: "Subscribe to view online User locations and Display your Menu on your profile" });
    }
});
exports.onlineLanlogUser = onlineLanlogUser;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    const profile = yield Profile_1.Profile.findAll({ where: { lanlogId: id } });
    return res.status(200).send({ message: "Fetched Successfully", profile });
});
exports.getProfile = getProfile;
const getFirstFiveEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currentDate = new Date();
    const event = yield Event_1.Events.findAll({
        where: {
            formated_date: {
                [sequelize_1.Sequelize.Op.gt]: currentDate,
            },
        },
        include: [{ model: Users_1.Users, include: [{ model: Profile_1.Profile }] }]
    });
    return res.status(200).send({ message: "Fetched Successfully", event });
});
exports.getFirstFiveEvents = getFirstFiveEvents;
const getVendorEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const event = yield Event_1.Events.findAll({
        where: {
            userId: id
        }
    });
    return res.status(200).send({ message: "Fetched Successfully", event });
});
exports.getVendorEvent = getVendorEvent;
const filterVendorBytag = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tag } = req.query;
    const profile = yield Profile_1.Profile.findAll({
        where: { tag: tag === null || tag === void 0 ? void 0 : tag.toString().toLowerCase() }, include: [
            { model: Users_1.Users }, { model: LanLog_1.LanLog }
        ]
    });
    return res.status(200).send({ message: "Fetched Successfully", profile });
});
exports.filterVendorBytag = filterVendorBytag;
const getFirstFivePorpular = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const popular = yield Popular_1.PopularVendor.findAll({ limit: 10 });
    return res.status(200).send({ message: "Fetched Successfully", popular });
});
exports.getFirstFivePorpular = getFirstFivePorpular;
const getTags = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tags = yield Tag_1.Tag.findAll({});
    return res.status(200).send({ message: "Fetched Successfully", tags });
});
exports.getTags = getTags;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const user = yield Users_1.Users.findAll({
        where: { id }
    });
    return res.status(200).send({
        message: "Fetched Successfully", user
    });
});
exports.getUser = getUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const user = yield Users_1.Users.findOne({
        where: { id }
    });
    const profile = yield Profile_1.Profile.findOne({
        where: { userId: user === null || user === void 0 ? void 0 : user.id }
    });
    if (profile) {
        yield profile.destroy();
        yield user.destroy();
    }
    else {
        yield user.destroy();
    }
    return res.status(200).send({
        message: "Fetched Successfully"
    });
});
exports.deleteUser = deleteUser;
const getAllTags = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tags = yield Alltags_1.AllTag.findAll({
        where: {}
    });
    return res.status(200).send({
        message: "Fetched Successfully", tags
    });
});
exports.getAllTags = getAllTags;
const getVendorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const profile = yield Profile_1.Profile.findOne({
        where: { userId: id }, include: [
            { model: Users_1.Users },
            { model: LanLog_1.LanLog },
        ],
    });
    const menus = yield Menus_1.Menu.findAll({
        where: { userId: id }, include: [
            { model: Extras_1.Extra }
        ]
    });
    const events = yield Event_1.Events.findAll({ where: { userId: id } });
    const order = yield Order_1.Order.findAll({
        where: { profileId: profile === null || profile === void 0 ? void 0 : profile.id }, include: [
            { model: Menus_1.Menu },
            { model: Users_1.Users },
        ],
    });
    return res.status(200).send({
        message: "Fetched Successfully", profile: {
            menus,
            events,
            order,
            profile: profile
        }
    });
});
exports.getVendorProfile = getVendorProfile;
const getSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.user;
        const user = yield Users_1.Users.findOne({ where: { id } });
        const subscription = yield stripe.subscriptions.retrieve(user === null || user === void 0 ? void 0 : user.subscription_id);
        return res.status(200).send({ message: "Fetched Successfully", status: subscription.status });
    }
    catch (error) {
        return res.status(200).send({ message: "Fetched Successfully", status: "null" });
    }
});
exports.getSubscription = getSubscription;
const getLanLog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const lanlog = yield LanLog_1.LanLog.findAll({
        where: { userId: id }, include: [{
                model: Users_1.Users,
                attributes: [
                    'createdAt', 'updatedAt', "subscription_id"
                ]
            }
        ],
    });
    return res.status(200).send({ message: "Fetched Successfully", lanlog });
});
exports.getLanLog = getLanLog;
const updateLanLog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, online } = req.body;
    const lanlog = yield LanLog_1.LanLog.findOne({ where: { id } });
    yield (lanlog === null || lanlog === void 0 ? void 0 : lanlog.update({ online }));
    return res.status(200).send({ message: "Fetched Successfully", lanlog });
});
exports.updateLanLog = updateLanLog;
const rateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, rate } = req.body;
    const profile = yield Profile_1.Profile.findOne({ where: { id } });
    const truckUser = yield Users_1.Users.findOne({ where: { id: profile.userId } });
    yield Rate_1.Rating.create({
        profileId: profile === null || profile === void 0 ? void 0 : profile.id, rate, truckId: truckUser === null || truckUser === void 0 ? void 0 : truckUser.id, userId: req.user.id
    });
    yield (profile === null || profile === void 0 ? void 0 : profile.update({ totalRate: profile.totalRate + 1, meanRate: profile.meanRate + Number(rate), rate: ((profile.meanRate + Number(rate)) / (profile.totalRate + 1)) }));
    return res.status(200).send({ message: "Fetched Successfully", profile });
});
exports.rateProfile = rateProfile;
const fetchRate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    const rate = yield Rate_1.Rating.findAll({ where: { userId: req.user.id, profileId: id } });
    return res.status(200).send({ message: "Fetched Successfully", rate });
});
exports.fetchRate = fetchRate;
const vendorMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    const user = yield Users_1.Users.findOne({ where: { id } });
    const profile = yield Profile_1.Profile.findOne({ where: { userId: user === null || user === void 0 ? void 0 : user.id } });
    const menu = yield Menus_1.Menu.findAll({
        where: { userId: id }, include: [{ model: Extras_1.Extra }]
    });
    stripe.subscriptions.retrieve(user === null || user === void 0 ? void 0 : user.subscription_id).then(function (subscription_status) {
        if (subscription_status.status == 'active' || subscription_status.status == 'trialing') {
            return res.status(200).send({
                message: "Fetched Successfully",
                menu
            });
        }
        else {
            console.log("meeeeeeeee");
            console.log("youuuuuuuu");
            (0, notification_1.sendToken)(user === null || user === void 0 ? void 0 : user.id, `Foodtruck.express`.toUpperCase(), `Hey ${profile === null || profile === void 0 ? void 0 : profile.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`);
            (0, sms_1.sendEmailResend)(`${user === null || user === void 0 ? void 0 : user.email}`, "Foodtruck.express".toUpperCase(), (0, template_1.templateEmail)(`${user === null || user === void 0 ? void 0 : user.email}`, `Hey ${profile === null || profile === void 0 ? void 0 : profile.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`));
            return res.status(200).send({ message: "VENDOR MENU IS UNAVAILABLE", status: false });
        }
    }, function (err) {
        if (err instanceof stripe_1.default.errors.StripeError) {
            // Break down err based on err.type
            (0, notification_1.sendToken)(user === null || user === void 0 ? void 0 : user.id, `Foodtruck.express`.toUpperCase(), `Hey ${profile === null || profile === void 0 ? void 0 : profile.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`);
            (0, sms_1.sendEmailResend)(`${user === null || user === void 0 ? void 0 : user.email}`, "Foodtruck.express".toUpperCase(), (0, template_1.templateEmail)(`${user === null || user === void 0 ? void 0 : user.email}`, `Hey ${profile === null || profile === void 0 ? void 0 : profile.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`));
            console.log(err.type);
            return res.status(200).send({ message: "VENDOR MENU IS UNAVAILABLE", status: false });
        }
        else {
            // ...
            (0, notification_1.sendToken)(user === null || user === void 0 ? void 0 : user.id, `Foodtruck.express`.toUpperCase(), `Hey ${profile === null || profile === void 0 ? void 0 : profile.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`);
            (0, sms_1.sendEmailResend)(`${user === null || user === void 0 ? void 0 : user.email}`, "Foodtruck.express".toUpperCase(), (0, template_1.templateEmail)(`${user === null || user === void 0 ? void 0 : user.email}`, `Hey ${profile === null || profile === void 0 ? void 0 : profile.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`));
            console.log(err);
            return res.status(200).send({ message: "VENDOR MENU IS UNAVAILABLE", status: false });
        }
    });
});
exports.vendorMenu = vendorMenu;
const vendorEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    const user = yield Users_1.Users.findOne({ where: { id } });
    const event = yield Event_1.Events.findAll({
        where: { userId: id }, include: [
            { model: Users_1.Users, include: [{ model: Profile_1.Profile }] }
        ]
    });
    console.log(user === null || user === void 0 ? void 0 : user.subscription_id);
    const subscription_status = yield stripe.subscriptions.retrieve(user === null || user === void 0 ? void 0 : user.subscription_id).then(function (subscription_status) {
        if (subscription_status.status == 'active' || subscription_status.status == 'trialing') {
            // const menu = await Menu.findAll({ where: { userId: id }, include: [{ model: Extra }] })
            return res.status(200).send({
                message: "Fetched Successfully",
                event
            });
        }
        else {
            return res.status(200).send({ message: "VENDOR EVENT IS UNAVAILABLE", status: false });
        }
    }, function (err) {
        if (err instanceof stripe_1.default.errors.StripeError) {
            // Break down err based on err.type
            console.log(err.type);
            return res.status(200).send({ message: "VENDOR EVENT IS UNAVAILABLE", status: false });
        }
        else {
            // ...
            console.log(err);
            return res.status(200).send({ message: "VENDOR EVENT IS UNAVAILABLE", status: false });
        }
    });
});
exports.vendorEvent = vendorEvent;
const getMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const user = yield Users_1.Users.findOne({ where: { id } });
    console.log(user === null || user === void 0 ? void 0 : user.subscription_id);
    const menu = yield Menus_1.Menu.findAll({ where: { userId: id } });
    return res.status(200).send({ message: "Fetched Successfully", menu });
});
exports.getMenu = getMenu;
const getHomeDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const tags = yield HomeTag_1.HomeTag.findAll({ include: [{ model: Tag_1.Tag }] });
    const profileSecondTag = yield Profile_1.Profile.findAll({
        where: {
            [sequelize_1.Op.or]: [
                { 'tag': { [sequelize_1.Op.like]: '%' + `${(_b = tags[0].dataValues.tag.title) === null || _b === void 0 ? void 0 : _b.toString().toLowerCase()}` + '%' } },
            ]
        }, include: [
            { model: Users_1.Users }, { model: LanLog_1.LanLog }
        ]
    });
    const profileFirstTag = yield Profile_1.Profile.findAll({
        where: {
            [sequelize_1.Op.or]: [
                { 'tag': { [sequelize_1.Op.like]: '%' + `${(_c = tags[1].dataValues.tag.title) === null || _c === void 0 ? void 0 : _c.toString().toLowerCase()}` + '%' } },
            ]
        },
        include: [
            { model: Users_1.Users }, { model: LanLog_1.LanLog }
        ]
    });
    const currentDate = new Date();
    console.log(currentDate);
    const event = yield Event_1.Events.findAll({
        where: {
            formated_date: {
                [sequelize_1.Sequelize.Op.gte]: currentDate,
            },
        },
        include: [{ model: Users_1.Users, include: [{ model: Profile_1.Profile }] }]
    });
    const popular = yield Popular_1.PopularVendor.findAll({
        limit: 10,
        include: [
            {
                model: Profile_1.Profile, include: [
                    { model: Users_1.Users }, { model: LanLog_1.LanLog }
                ]
            }
        ]
    });
    // Manipulate the data to add a custom field
    const modifiedData = profileFirstTag.map(item => {
        // Add a custom field to each item in the list
        return Object.assign(Object.assign({}, item.get()), { number: 1 });
    });
    // Manipulate the data to add a custom field
    const modifiedData2 = profileSecondTag.map(item => {
        // Add a custom field to each item in the list
        return Object.assign(Object.assign({}, item.get()), { number: 2 });
    });
    return res.status(200).send({
        vendors: modifiedData.concat(modifiedData2),
        message: "Fetched Successfully",
        event,
        popular,
        tags
    });
});
exports.getHomeDetails = getHomeDetails;
const deleteMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const menu = yield Menus_1.Menu.findOne({ where: { id } });
    yield (menu === null || menu === void 0 ? void 0 : menu.destroy());
    return res.status(200).send({ message: "Deleted Successfully", menu });
});
exports.deleteMenu = deleteMenu;
const createMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { menu_title, menu_description, menu_price, extra } = req.body;
    const user = yield Users_1.Users.findOne({ where: { id } });
    const lanlog = yield LanLog_1.LanLog.findOne({ where: { userId: user === null || user === void 0 ? void 0 : user.id } });
    if (req.file) {
        const result = yield cloudinary.uploader.upload(req.file.path.replace(/ /g, "_"));
        console.log({
            menu_title, menu_description, menu_price,
            lanlogId: lanlog === null || lanlog === void 0 ? void 0 : lanlog.id,
            userId: user === null || user === void 0 ? void 0 : user.id,
            menu_picture: result.secure_url
        });
        const menu = yield Menus_1.Menu.create({
            menu_title, menu_description, menu_price,
            lanlogId: lanlog === null || lanlog === void 0 ? void 0 : lanlog.id,
            userId: user === null || user === void 0 ? void 0 : user.id,
            menu_picture: result.secure_url
        });
        let valueExtra = [];
        for (let value of extra) {
            valueExtra.push({
                extra_title: value.extra_title,
                extra_description: value.extra_description,
                extra_price: value.extra_price,
                menuId: menu.id
            });
        }
        yield Extras_1.Extra.bulkCreate(valueExtra);
        return res.status(200).send({ message: "Created Successfully", menu });
    }
    else {
        return res.status(400).send({ message: "Image is Required" });
    }
});
exports.createMenu = createMenu;
const updateMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    // console.log(userId);
    const { menu_title, menu_description, menu_price, extra } = req.body;
    const user = yield Users_1.Users.findOne({ where: { id: req.user.id } });
    const lanlog = yield LanLog_1.LanLog.findOne({ where: { userId: user === null || user === void 0 ? void 0 : user.id } });
    if (req.file) {
        const result = yield cloudinary.uploader.upload(req.file.path.replace(/ /g, "_"));
        const menu = yield Menus_1.Menu.findOne({ where: { id } });
        const extras = yield Extras_1.Extra.findAll({ menuId: id });
        let ids = [];
        for (let value of extras) {
            ids.push(value.id);
        }
        yield Extras_1.Extra.destroy({ where: { id: ids } });
        yield menu.update({
            menu_title: menu_title !== null && menu_title !== void 0 ? menu_title : menu === null || menu === void 0 ? void 0 : menu.menu_title, menu_description: menu_description !== null && menu_description !== void 0 ? menu_description : menu === null || menu === void 0 ? void 0 : menu.menu_description,
            menu_price: menu_price !== null && menu_price !== void 0 ? menu_price : menu === null || menu === void 0 ? void 0 : menu.menu_price,
            lanlogId: lanlog === null || lanlog === void 0 ? void 0 : lanlog.id,
            userId: user === null || user === void 0 ? void 0 : user.id,
            menu_picture: result.secure_url
        });
        let valueExtra = [];
        for (let value of extra) {
            valueExtra.push({
                extra_title: value.extra_title,
                extra_description: value.extra_description,
                extra_price: value.extra_price,
                menuId: menu.id
            });
        }
        yield Extras_1.Extra.bulkCreate(valueExtra);
        return res.status(200).send({ message: "Updated Successfully", menu });
    }
    else {
        const menu = yield Menus_1.Menu.findOne({ where: { id } });
        const extras = yield Extras_1.Extra.findAll({ menuId: id });
        let ids = [];
        for (let value of extras) {
            ids.push(value.id);
        }
        yield Extras_1.Extra.destroy({ where: { id: ids } });
        yield menu.update({
            menu_title: menu_title !== null && menu_title !== void 0 ? menu_title : menu === null || menu === void 0 ? void 0 : menu.menu_title, menu_description: menu_description !== null && menu_description !== void 0 ? menu_description : menu === null || menu === void 0 ? void 0 : menu.menu_description,
            menu_price: menu_price !== null && menu_price !== void 0 ? menu_price : menu === null || menu === void 0 ? void 0 : menu.menu_price,
            lanlogId: lanlog === null || lanlog === void 0 ? void 0 : lanlog.id,
            userId: user === null || user === void 0 ? void 0 : user.id,
            menu_picture: menu.menu_picture
        });
        let valueExtra = [];
        for (let value of extra) {
            valueExtra.push({
                extra_title: value.extra_title,
                extra_description: value.extra_description,
                extra_price: value.extra_price,
                menuId: menu.id
            });
        }
        yield Extras_1.Extra.bulkCreate(valueExtra);
        return res.status(200).send({ message: "Updated Successfully", menu });
    }
});
exports.updateMenu = updateMenu;
const updateEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    // console.log(userId);
    const { event_title, event_description, event_date, event_address } = req.body;
    console.log(event_date);
    const user = yield Users_1.Users.findOne({ where: { id: req.user.id } });
    let [day, month, year] = event_date.split("-");
    day = Number(day) + 1;
    const formattedDate = new Date(`${year}-${month}-${(day)}`);
    if (req.file) {
        const result = yield cloudinary.uploader.upload(req.file.path.replace(/ /g, "_"));
        const event = yield Event_1.Events.findOne({ where: { id } });
        yield event.update({
            event_title: event_title !== null && event_title !== void 0 ? event_title : event === null || event === void 0 ? void 0 : event.event_title,
            event_description: event_description !== null && event_description !== void 0 ? event_description : event === null || event === void 0 ? void 0 : event.event_description,
            event_date: event_date !== null && event_date !== void 0 ? event_date : event === null || event === void 0 ? void 0 : event.event_date,
            formated_date: event_date == null ? event === null || event === void 0 ? void 0 : event.formated_date : formattedDate,
            event_address: event_address !== null && event_address !== void 0 ? event_address : event === null || event === void 0 ? void 0 : event.event_address,
            menu_picture: result.secure_url
        });
        return res.status(200).send({ message: "Updated Successfully", event });
    }
    else {
        const event = yield Event_1.Events.findOne({ where: { id } });
        yield event.update({
            event_title: event_title !== null && event_title !== void 0 ? event_title : event === null || event === void 0 ? void 0 : event.event_title,
            event_description: event_description !== null && event_description !== void 0 ? event_description : event === null || event === void 0 ? void 0 : event.event_description,
            event_date: event_date !== null && event_date !== void 0 ? event_date : event === null || event === void 0 ? void 0 : event.event_date,
            formated_date: event_date == null ? event === null || event === void 0 ? void 0 : event.formated_date : formattedDate,
            event_address: event_address !== null && event_address !== void 0 ? event_address : event === null || event === void 0 ? void 0 : event.event_address,
        });
        return res.status(200).send({ message: "Updated Successfully", event });
    }
});
exports.updateEvent = updateEvent;
// Menu
//Events
const getEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const user = yield Users_1.Users.findOne({ where: { id } });
    console.log(user === null || user === void 0 ? void 0 : user.subscription_id);
    const events = yield Event_1.Events.findAll({ where: { userId: id } });
    return res.status(200).send({ message: "Fetched Successfully", events });
});
exports.getEvent = getEvent;
const deleteEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const events = yield Event_1.Events.findOne({ where: { id } });
    yield (events === null || events === void 0 ? void 0 : events.destroy());
    return res.status(200).send({ message: "Deleted Successfully", events });
});
exports.deleteEvent = deleteEvent;
const sendTestEmailCon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const send = yield (0, sms_1.sendEmailResend)("dailydevo9@gmail.com", "TEST", (0, template_1.templateEmail)("TEST", "dailydevo9@gmail.com".toString()));
    return res.status(200).send({ message: "Successfully", send });
});
exports.sendTestEmailCon = sendTestEmailCon;
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.user;
        const { event_title, event_description, event_date, event_address } = req.body;
        const user = yield Users_1.Users.findOne({ where: { id } });
        if (req.file) {
            const result = yield cloudinary.uploader.upload(req.file.path.replace(/ /g, "_"));
            let [day, month, year] = event_date.split("-");
            day = Number(day) + 1;
            console.log(event_date);
            console.log(`${year}-${month}-${(day)}`);
            const formattedDate = new Date(`${year}-${month}-${(day)}`);
            const event = yield Event_1.Events.create({
                event_title,
                event_description,
                event_address,
                event_date,
                formated_date: formattedDate,
                userId: user === null || user === void 0 ? void 0 : user.id,
                menu_picture: result.secure_url
            });
            return res.status(200).send({ message: "Created Successfully", event });
        }
        else {
            return res.status(400).send({ message: "Image is Required" });
        }
    }
    catch (e) {
        console.log(e);
        return res.status(400).send({ message: "Failed" });
    }
});
exports.createEvent = createEvent;
//# sourceMappingURL=index.js.map