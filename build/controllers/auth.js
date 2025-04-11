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
exports.passwordChange = exports.login = exports.validateReg = exports.googleRegister = exports.googleLogin = exports.verifyOtp = exports.sendOtp = void 0;
const utility_1 = require("../helpers/utility");
const Verify_1 = require("../models/Verify");
const sms_1 = require("../services/sms");
const Users_1 = require("../models/Users");
const TOKEN_SECRET = "222hwhdhnnjduru838272@@$henncndbdhsjj333n33brnfn";
const saltRounds = 10;
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const template_1 = require("../config/template");
const axios_1 = __importDefault(require("axios"));
const nodemailer = require("nodemailer");
// import { Professional } from "../models/Professional";
const sendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const serviceId = (0, utility_1.randomId)(12);
    const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
    console.log(codeEmail);
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
    const { serviceId, emailCode, type, password } = req.body;
    const verifyEmail = yield Verify_1.Verify.findOne({
        where: {
            serviceId,
        },
    });
    if (verifyEmail) {
        if (verifyEmail.code === emailCode) {
            const verifyEmailResult = yield Verify_1.Verify.findOne({
                where: { id: verifyEmail.id },
            });
            if ((verifyEmailResult === null || verifyEmailResult === void 0 ? void 0 : verifyEmailResult.otpType) === "FORGET") {
                (0, bcryptjs_1.hash)(password, saltRounds, function (err, hashedPassword) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const userExist = yield Users_1.Users.findOne({ where: { email: verifyEmailResult === null || verifyEmailResult === void 0 ? void 0 : verifyEmailResult.client } });
                        const user = yield (userExist === null || userExist === void 0 ? void 0 : userExist.update({
                            password: hashedPassword,
                        }));
                        yield (verifyEmailResult === null || verifyEmailResult === void 0 ? void 0 : verifyEmailResult.destroy());
                        let token = (0, jsonwebtoken_1.sign)({ id: user === null || user === void 0 ? void 0 : user.id, email: user === null || user === void 0 ? void 0 : user.email }, TOKEN_SECRET);
                        return (0, utility_1.successResponse)(res, "Successful", token);
                    });
                });
            }
            else {
                if (type === Users_1.UserType.USER) {
                    yield (0, sms_1.sendEmailResend)(verifyEmail.client.toString(), `Welcome to Foodtruck.Express`, (0, template_1.templateEmail)("Welcome to Foodtruck.Express", (0, template_1.userWelcomeTemplate)()));
                }
                else {
                    yield (0, sms_1.sendEmailResend)(verifyEmail.client.toString(), `Welcome to Foodtruck.Express`, (0, template_1.templateEmail)("Welcome to Foodtruck.Express", (0, template_1.vendorWelcomeTemplate)()));
                }
                (0, bcryptjs_1.hash)(password, saltRounds, function (err, hashedPassword) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const userExist = yield Users_1.Users.findOne({ where: { email: verifyEmailResult === null || verifyEmailResult === void 0 ? void 0 : verifyEmailResult.client } });
                        if (!(0, utility_1.validateEmail)(verifyEmailResult === null || verifyEmailResult === void 0 ? void 0 : verifyEmailResult.client))
                            return (0, utility_1.errorResponse)(res, "Enter a valid email");
                        else if (userExist)
                            return (0, utility_1.errorResponse)(res, "Email already exist");
                        const user = yield Users_1.Users.create({
                            username: verifyEmailResult === null || verifyEmailResult === void 0 ? void 0 : verifyEmailResult.username,
                            email: verifyEmailResult === null || verifyEmailResult === void 0 ? void 0 : verifyEmailResult.client,
                            password: hashedPassword,
                            type,
                        });
                        yield (verifyEmailResult === null || verifyEmailResult === void 0 ? void 0 : verifyEmailResult.destroy());
                        let token = (0, jsonwebtoken_1.sign)({ id: user.id, email: user.email }, TOKEN_SECRET);
                        return (0, utility_1.successResponse)(res, "Successful", token);
                    });
                });
            }
        }
        else {
            (0, utility_1.errorResponse)(res, "Invalid Email Code", {
                message: "Invalid Email Code",
                status: false,
            });
        }
    }
    else {
        (0, utility_1.errorResponse)(res, "Email Code Already Used", {
            message: "Email Code Already Used",
            status: false,
        });
    }
});
exports.verifyOtp = verifyOtp;
const googleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let { accessToken } = req.body;
    const response = yield axios_1.default.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = yield Users_1.Users.findOne({ where: { email: (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.email } });
    if (!user)
        return (0, utility_1.errorResponse)(res, "User does not exist");
    const match = yield (0, bcryptjs_1.compare)((_b = response === null || response === void 0 ? void 0 : response.data) === null || _b === void 0 ? void 0 : _b.id, user.password);
    if (!match)
        return (0, utility_1.errorResponse)(res, "Invalid Credentials");
    let token = (0, jsonwebtoken_1.sign)({ id: user.id, email: user.email }, TOKEN_SECRET);
    return (0, utility_1.successResponse)(res, "Success login", { token, type: user.type });
});
exports.googleLogin = googleLogin;
const googleRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e;
    const { accessToken, type } = req.body;
    const response = yield axios_1.default.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (type === Users_1.UserType.USER) {
        yield (0, sms_1.sendEmailResend)((_c = response === null || response === void 0 ? void 0 : response.data) === null || _c === void 0 ? void 0 : _c.email.toString(), `Welcome to Foodtruck.Express`, (0, template_1.templateEmail)("Welcome to Foodtruck.Express", (0, template_1.userWelcomeTemplate)()));
    }
    else {
        yield (0, sms_1.sendEmailResend)((_d = response === null || response === void 0 ? void 0 : response.data) === null || _d === void 0 ? void 0 : _d.email.toString(), `Welcome to Foodtruck.Express`, (0, template_1.templateEmail)("Welcome to Foodtruck.Express", (0, template_1.vendorWelcomeTemplate)()));
    }
    (0, bcryptjs_1.hash)((_e = response === null || response === void 0 ? void 0 : response.data) === null || _e === void 0 ? void 0 : _e.id, saltRounds, function (err, hashedPassword) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const userExist = yield Users_1.Users.findOne({ where: { email: (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.email } });
            if (!(0, utility_1.validateEmail)((_b = response === null || response === void 0 ? void 0 : response.data) === null || _b === void 0 ? void 0 : _b.email))
                return (0, utility_1.errorResponse)(res, "Enter a valid email");
            else if (userExist)
                return (0, utility_1.errorResponse)(res, "Email already exist");
            const user = yield Users_1.Users.create({
                username: (_c = response === null || response === void 0 ? void 0 : response.data) === null || _c === void 0 ? void 0 : _c.name,
                email: (_d = response === null || response === void 0 ? void 0 : response.data) === null || _d === void 0 ? void 0 : _d.email,
                password: hashedPassword,
                type,
            });
            let token = (0, jsonwebtoken_1.sign)({ id: user.id, email: user.email }, TOKEN_SECRET);
            return (0, utility_1.successResponse)(res, "Successful", token);
        });
    });
});
exports.googleRegister = googleRegister;
const validateReg = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, type, username, otpType } = req.body;
    console.log(otpType);
    const userExist = yield Users_1.Users.findOne({ where: { email } });
    if (!(0, utility_1.validateEmail)(email) && otpType != "FORGET")
        return (0, utility_1.errorResponse)(res, "Enter a valid email");
    else if (password.toString() <= 6 && otpType != "FORGET")
        return (0, utility_1.errorResponse)(res, "Password should be greater than 6 digits");
    else if (userExist && otpType != "FORGET")
        return (0, utility_1.errorResponse)(res, "Email already exist");
    else if (!userExist && otpType === "FORGET")
        return (0, utility_1.errorResponse)(res, "Email doesn't exist");
    const serviceId = (0, utility_1.randomId)(12);
    const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
    yield Verify_1.Verify.create({
        serviceId,
        code: codeEmail,
        client: email,
        username,
        otpType,
        type,
        secret_key: (0, utility_1.createRandomRef)(12, "foodtruck"),
    });
    console.log(codeEmail);
    const emailResult = yield (0, sms_1.sendEmailResend)(email, "Foodtruck otp code", (0, template_1.templateEmail)("OTP CODE", codeEmail.toString()));
    return (0, utility_1.successResponse)(res, "Successful", serviceId);
});
exports.validateReg = validateReg;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { email, password } = req.body;
    const user = yield Users_1.Users.findOne({ where: { email } });
    if (!user)
        return (0, utility_1.errorResponse)(res, "User does not exist");
    const match = yield (0, bcryptjs_1.compare)(password, user.password);
    if (!match)
        return (0, utility_1.errorResponse)(res, "Invalid Credentials");
    let token = (0, jsonwebtoken_1.sign)({ id: user.id, email: user.email }, TOKEN_SECRET);
    return (0, utility_1.successResponse)(res, "Success login", { token, type: user.type });
});
exports.login = login;
const passwordChange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { newPassword, email } = req.body;
    const user = yield Users_1.Users.findOne({ where: { email } });
    if (!user)
        return (0, utility_1.errorResponse)(res, "User does not exist");
    (0, bcryptjs_1.hash)(newPassword, saltRounds, function (err, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            yield user.update({ password: hashedPassword });
            let token = (0, jsonwebtoken_1.sign)({ id: user.id, email: user.email }, TOKEN_SECRET);
            return (0, utility_1.successResponse)(res, "Successful", {
                status: true,
                message: Object.assign(Object.assign({}, user.dataValues), { token }),
            });
        });
    });
});
exports.passwordChange = passwordChange;
//# sourceMappingURL=auth.js.map