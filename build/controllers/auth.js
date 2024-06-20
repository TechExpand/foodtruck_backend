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
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordChange = exports.login = exports.validateReg = exports.register = exports.verifyOtp = exports.sendOtp = void 0;
const utility_1 = require("../helpers/utility");
const Verify_1 = require("../models/Verify");
const sms_1 = require("../services/sms");
const Users_1 = require("../models/Users");
const TOKEN_SECRET = "222hwhdhnnjduru838272@@$henncndbdhsjj333n33brnfn";
const saltRounds = 10;
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const template_1 = require("../config/template");
const nodemailer = require("nodemailer");
// import { Professional } from "../models/Professional";
const sendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const serviceId = (0, utility_1.randomId)(12);
    const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
    console.log(codeEmail);
    yield Verify_1.Verify.create({
        serviceId,
        code: codeEmail,
        client: email,
        secret_key: (0, utility_1.createRandomRef)(12, "foodtruck"),
    });
    const emailResult = yield (0, sms_1.sendEmailResend)(email, "Foodtruck otp code", (0, template_1.templateEmail)("OTP CODE", codeEmail.toString()));
    return (0, utility_1.successResponse)(res, "Successful", { serviceId });
});
exports.sendOtp = sendOtp;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceId, emailCode } = req.body;
    const verifyEmail = yield Verify_1.Verify.findOne({
        where: {
            serviceId
        }
    });
    if (verifyEmail) {
        if (verifyEmail.code === emailCode) {
            const verifyEmailResult = yield Verify_1.Verify.findOne({ where: { id: verifyEmail.id } });
            yield (verifyEmailResult === null || verifyEmailResult === void 0 ? void 0 : verifyEmailResult.destroy());
            const user = yield Users_1.Users.findOne({ where: { email: verifyEmail.client.toString() } });
            yield (0, sms_1.sendEmailResend)(verifyEmail.client.toString(), "'Welcome to Foodtruck.Express'", (user === null || user === void 0 ? void 0 : user.type) == Users_1.UserType.USER ? (0, template_1.templateEmail)('Welcome to Foodtruck.Express', `Welcome aboard the FoodTruck Express community! 🎉<br><br>
          
          
          Your account has been successfully created, and you are now part of a vibrant community.<br><br>
          
          
          We’re thrilled to have you join us on this exciting culinary adventure. Get ready to discover, order, and savor the best food truck experiences in your city!<br><br>
          
          
          Here's a quick guide to kickstart your FoodTruck.Express journey:<br>
          🚚 Locate & Love: Use our app to find your favorite food trucks on the move. Whether you’re craving tacos, pizza, or something exotic, we’ve got you covered.<br>
          
          🌮 Share the Love: Have a fantastic experience? Share the FoodTruck Express love with friends and family. The more, the merrier!<br>
          
          🎉 Exclusive Updates: Stay in the loop! Receive updates on citywide food truck events and exclusive offers. Don’t miss out on any flavor-filled festivities.<br>
          
          Feel free to explore, share, and let us know how we can make your FoodTruck Express experience even better. Your feedback matters!<br><br>
          
          
          Happy exploring and happy eating!<br><br>
          
          
          Best, The FoodTruck Express Team 🍔🍕🌯<br><br>
          
          
          P.S. Spread the word! Tell your friends about FoodTruck Express and let’s build a community of foodies together. Sharing is caring!<br>`) :
                (0, template_1.templateEmail)('Welcome to Foodtruck.Express', `Welcome aboard the FoodTruck Express community! 🎉<br><br>


       Your account has been successfully created, and you are now part of a vibrant community.<br>
       
       
       Welcome aboard, food truck operators! We're thrilled to have you on board and excited to help you connect with hungry customers in your area.  <br>With real-time access to your location through our app, you'll attract hungry customers like never before. Let's hit the road together and bring the joy of delicious food to every corner of the city!<br>
       
       Here's what you can expect with foodtruck.express:<br><br>
       Reach a wider audience 🌟: Showcase your mouthwatering dishes to a vast audience of hungry app users craving fantastic street eats.<br>
       
       Effortless management 📲: Easily update your menu, location, and operating hours through our user-friendly app.<br>
       
       Increase sales 💰: Harness the power of our integrated location system, enabling customers to easily find and flock to your truck.<br>
       
       Cultivate your brand 🌱: Cultivate your reputation with valuable customer feedback, participate in curated events, and host your own promotions to captivate an even larger audience of food truck enthusiasts.<br><br>
       
       Ready to Roll?<br><br>
       
       Once you  familiarize yourself with the platform, update your profile with your delicious menu. Let your social followers know that they can now find you in real time with the FoodTruck.Express platform!   We can't wait to see you hitting the streets and serving up amazing food!<br><br>
       
       
       Have questions?<br><br>
       
       
       Our dedicated support team is always happy to help. Feel free to reach out to us at support@foodtruck.express anytime. Welcome to the Foodtruck.Express family!<br>
       
       
        Best, The Foodtruck.Express Team<br><br>`));
            return (0, utility_1.successResponse)(res, "Successful", {
                message: "successful",
                status: true
            });
        }
        else {
            (0, utility_1.errorResponse)(res, "Failed", {
                message: "Invalid Email Code",
                status: false
            });
        }
    }
    else {
        (0, utility_1.errorResponse)(res, "Failed", {
            message: "Email Code Already Used",
            status: false
        });
    }
});
exports.verifyOtp = verifyOtp;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, type } = req.body;
    (0, bcryptjs_1.hash)(password, saltRounds, function (err, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const userExist = yield Users_1.Users.findOne({ where: { email } });
            if (!(0, utility_1.validateEmail)(email))
                return res.status(400).send({ email: ["Enter a valid email"] });
            else if (password.toString() <= 6)
                return res.status(400).send({ password: ["Password should be greater than 6 digits"] });
            else if (userExist)
                return res.status(400).send({ email: ["Email already exist"] });
            //  else if(userExist) return errorResponse(res, "Failed", {status: false, message: "Email/Phone already exist"})
            const user = yield Users_1.Users.create({
                email, password: hashedPassword, type
            });
            let token = (0, jsonwebtoken_1.sign)({ id: user.id, email: user.email }, TOKEN_SECRET);
            return res.status(200).send({ token });
        });
    });
});
exports.register = register;
const validateReg = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, type } = req.body;
    const userExist = yield Users_1.Users.findOne({ where: { email }, });
    if (!(0, utility_1.validateEmail)(email))
        return res.status(400).send({ email: ["Enter a valid email"], message: false });
    else if (password.toString() <= 6)
        return res.status(400).send({ password: ["Password should be greater than 6 digits"], message: false });
    else if (userExist)
        return res.status(400).send({ email: ["Email already exist"], message: false });
    const serviceId = (0, utility_1.randomId)(12);
    const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
    yield Verify_1.Verify.create({
        serviceId,
        code: codeEmail,
        client: email,
        secret_key: (0, utility_1.createRandomRef)(12, "foodtruck"),
    });
    const emailResult = yield (0, sms_1.sendEmailResend)(email, "Foodtruck otp code", (0, template_1.templateEmail)("OTP CODE", codeEmail.toString()));
    // return successResponse(res, "Successful", { serviceId })
    return res.status(200).send({ message: true, serviceId });
});
exports.validateReg = validateReg;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { email, password } = req.body;
    const user = yield Users_1.Users.findOne({ where: { email } });
    if (!user)
        return (0, utility_1.errorResponse)(res, "Failed", { status: false, message: "User does not exist" });
    const match = yield (0, bcryptjs_1.compare)(password, user.password);
    if (!match)
        return (0, utility_1.errorResponse)(res, "Failed", { status: false, message: "Invalid Credentials" });
    let token = (0, jsonwebtoken_1.sign)({ id: user.id, email: user.email }, TOKEN_SECRET);
    return res.status(200).send({ token, type: user.type });
});
exports.login = login;
const passwordChange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { newPassword, email } = req.body;
    const user = yield Users_1.Users.findOne({ where: { email } });
    if (!user)
        return (0, utility_1.errorResponse)(res, "Failed", { status: false, message: "User does not exist" });
    (0, bcryptjs_1.hash)(newPassword, saltRounds, function (err, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            yield user.update({ password: hashedPassword });
            let token = (0, jsonwebtoken_1.sign)({ id: user.id, email: user.email }, TOKEN_SECRET);
            return (0, utility_1.successResponse)(res, "Successful", { status: true, message: Object.assign(Object.assign({}, user.dataValues), { token }) });
        });
    });
});
exports.passwordChange = passwordChange;
//# sourceMappingURL=auth.js.map