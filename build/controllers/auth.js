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
exports.changePassword = exports.login = exports.register2 = exports.register = exports.verifyOtp = exports.sendOtp = void 0;
const utility_1 = require("../helpers/utility");
const Verify_1 = require("../models/Verify");
const sms_1 = require("../services/sms");
const sequelize_1 = require("sequelize");
const Users_1 = require("../models/Users");
const TOKEN_SECRET = "222hwhdhnnjduru838272@@$henncndbdhsjj333n33brnfn";
const saltRounds = 10;
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const nodemailer = require("nodemailer");
// import { Professional } from "../models/Professional";
const sendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phone, type } = req.body;
    const serviceId = (0, utility_1.randomId)(12);
    const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
    const codeSms = String(Math.floor(1000 + Math.random() * 9000));
    if (type == Verify_1.VerificationType.BOTH) {
        yield Verify_1.Verify.create({
            serviceId,
            code: codeSms
        });
        yield Verify_1.Verify.create({
            serviceId,
            code: codeEmail
        });
        const smsResult = yield (0, sms_1.sendSMS)(phone, codeSms.toString());
        const emailResult = yield (0, sms_1.sendEmail)(email, codeEmail.toString());
        if (smsResult.status && emailResult.status)
            return (0, utility_1.successResponse)(res, "Successful", Object.assign(Object.assign({}, smsResult), { serviceId }));
        return (0, utility_1.errorResponse)(res, "Failed", emailResult);
    }
    else if (type == Verify_1.VerificationType.SMS) {
        yield Verify_1.Verify.create({
            serviceId,
            code: codeSms
        });
        const smsResult = yield (0, sms_1.sendSMS)(phone, codeSms.toString());
        if (smsResult.status)
            return (0, utility_1.successResponse)(res, "Successful", Object.assign(Object.assign({}, smsResult), { serviceId }));
        return (0, utility_1.errorResponse)(res, "Failed", smsResult);
    }
    else {
        yield Verify_1.Verify.create({
            serviceId,
            code: codeEmail,
            client: email,
            secret_key: (0, utility_1.createRandomRef)(12, "ace_pick"),
        });
        const emailResult = yield (0, sms_1.sendEmail)(email, codeEmail.toString());
        if (emailResult.status)
            return (0, utility_1.successResponse)(res, "Successful", Object.assign(Object.assign({}, emailResult), { serviceId }));
        return (0, utility_1.errorResponse)(res, "Failed", emailResult);
    }
});
exports.sendOtp = sendOtp;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceId, emailCode } = req.body;
    if (type == Verify_1.VerificationType.BOTH) {
        const verifySms = yield Verify_1.Verify.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { serviceId },
                    { code: smsCode }
                ]
            }
        });
        const verifyEmail = yield Verify_1.Verify.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { serviceId },
                    { code: emailCode }
                ]
            }
        });
        if (verifyEmail && verifySms) {
            if (verifyEmail.code === emailCode && verifySms.code === smsCode || verifyEmail.code === smsCode && verifySms.code === emailCode) {
                const verifyEmailResult = yield Verify_1.Verify.findOne({ where: { id: verifyEmail.id } });
                const verifySmsResult = yield Verify_1.Verify.findOne({ where: { id: verifySms.id } });
                yield (verifyEmailResult === null || verifyEmailResult === void 0 ? void 0 : verifyEmailResult.destroy());
                yield (verifySmsResult === null || verifySmsResult === void 0 ? void 0 : verifySmsResult.destroy());
                return (0, utility_1.successResponse)(res, "Successful", {
                    message: "successful",
                    status: true
                });
            }
            else {
                console.log(verifyEmail.code);
                console.log(emailCode);
                (0, utility_1.errorResponse)(res, "Failed", {
                    message: "Invalid Code",
                    status: false
                });
            }
        }
        else {
            console.log(verifyEmail);
            console.log(verifySms);
            (0, utility_1.errorResponse)(res, "Failed", {
                message: "Code Already Used",
                status: false
            });
        }
    }
    else if (type == Verify_1.VerificationType.SMS) {
        const verifySms = yield Verify_1.Verify.findOne({
            where: {
                serviceId
            }
        });
        if (verifySms) {
            if (verifySms.code === smsCode) {
                const verifySmsResult = yield Verify_1.Verify.findOne({ where: { id: verifySms.id } });
                yield (verifySmsResult === null || verifySmsResult === void 0 ? void 0 : verifySmsResult.destroy());
                return (0, utility_1.successResponse)(res, "Successful", {
                    message: "successful",
                    status: true
                });
            }
            else {
                (0, utility_1.errorResponse)(res, "Failed", {
                    message: "Invalid Sms Code",
                    status: false
                });
            }
        }
        else {
            (0, utility_1.errorResponse)(res, "Failed", {
                message: "Sms Code Already Used",
                status: false
            });
        }
    }
    else if (type == Verify_1.VerificationType.EMAIL) {
        const verifyEmail = yield Verify_1.Verify.findOne({
            where: {
                serviceId
            }
        });
        if (verifyEmail) {
            if (verifyEmail.code === smsCode) {
                const verifyEmailResult = yield Verify_1.Verify.findOne({ where: { id: verifyEmail.id } });
                yield (verifyEmailResult === null || verifyEmailResult === void 0 ? void 0 : verifyEmailResult.destroy());
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
    }
    else {
        const verifyEmail = yield Verify_1.Verify.findOne({
            where: {
                serviceId
            }
        });
        if (verifyEmail || verifyEmail.used) {
            if (verifyEmail.code === smsCode) {
                const verifyEmailResult = yield Verify_1.Verify.findOne({ where: { id: verifyEmail.id } });
                yield (verifyEmailResult === null || verifyEmailResult === void 0 ? void 0 : verifyEmailResult.update({ used: true }));
                return (0, utility_1.successResponse)(res, "Successful", {
                    message: "successful",
                    status: true,
                    secret_key: verifyEmailResult === null || verifyEmailResult === void 0 ? void 0 : verifyEmailResult.secret_key
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
// let transporter = nodemailer.createTransport({
//   host: "wingudigital.com",
//   port:  465,
//   // 587
//   auth: {
//     user: "app@wingudigital.com",
//     pass: "o30cnK68_"
//   }
//   });
const register2 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query;
    console.log(email);
    yield (0, sms_1.sendEmailResend)(email.toString(), 'Welcome to Foodtruck.Express', `<p>Just a test</p>`);
    res.send({ message: "message sent" });
    // transporter.sendMail(mailOptions, function(err:any, data:any) {
    //     if (err) {
    //       console.log("Error " + err);
    //       res.send({message: err})
    //     } else {
    //       console.log("Email sent successfully");
    //       res.send({message: "message sent"})
    //     }
    //   });
});
exports.register2 = register2;
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
    return res.status(200).send({ token });
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
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, secret_key } = req.body;
    const verify = yield Verify_1.Verify.findOne({ where: {
            secret_key,
            used: true
        } });
    if (!verify)
        return (0, utility_1.errorResponse)(res, "Failed", { status: false, message: "Invalid Client Secret" });
    (0, bcryptjs_1.hash)(password, saltRounds, function (err, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield Users_1.Users.findOne({ where: { email: verify.client } });
            user === null || user === void 0 ? void 0 : user.update({ password: hashedPassword });
            let token = (0, jsonwebtoken_1.sign)({ id: user.id, email: user.email }, TOKEN_SECRET);
            yield verify.destroy();
            return (0, utility_1.successResponse)(res, "Successful", Object.assign(Object.assign({}, user === null || user === void 0 ? void 0 : user.dataValues), { token }));
        });
    });
});
exports.changePassword = changePassword;
//# sourceMappingURL=auth.js.map