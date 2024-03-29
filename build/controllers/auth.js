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
            yield (0, sms_1.sendEmailResend)(verifyEmail.client.toString(), "'Welcome to Foodtruck.Express'", (0, template_1.templateEmail)('Welcome to Foodtruck.Express', `Dear User,\n\n

      Welcome to [Foodtruck.Express! We're thrilled to have you join our community.\n
      
      Thank you for registering with us. Your account has been successfully created, and you are now part of a vibrant community.\n
      
      If you have any questions or need assistance, feel free to reach out to our support team at [support email or contact details]. We're here to help!\n
      
      Once again, welcome aboard, and thank you for choosing Foodtruck.Express. We look forward to providing you with a fantastic experience.\n
      
      Best regards,\n
      Tminter`));
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
    console.log(email);
    console.log(password);
    const user = yield Users_1.Users.findOne({ where: { email } });
    console.log(user);
    if (!user)
        return (0, utility_1.errorResponse)(res, "Failed", { status: false, message: "User does not exist" });
    const match = yield (0, bcryptjs_1.compare)(password, user.password);
    if (!match)
        return (0, utility_1.errorResponse)(res, "Failed", { status: false, message: "Invalid Credentials" });
    let token = (0, jsonwebtoken_1.sign)({ id: user.id, email: user.email }, TOKEN_SECRET);
    return res.status(200).send({ token, type: user.type });
});
exports.login = login;
// export const recoverPassword = async (req: Request, res: Response)=>{
//     const { email } = req.body;
//     const serviceId = randomId(12);
//     const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
//         await Verify.create({
//             serviceId,
//             code:codeEmail,
//             client: email,
//             secret_key: createRandomRef(12, "ace_pick",),
//           })
//           const emailResult = await sendEmail(email, codeEmail.toString());
//           if(emailResult.status) return successResponse(res, "Successful", {...emailResult, serviceId})
//           return errorResponse(res, "Failed", emailResult)
// };
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