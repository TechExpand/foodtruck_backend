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
exports.sendEmail = exports.sendEmailResend = exports.sendSMS = void 0;
const axios = require("axios");
const resend_1 = require("resend");
const configSetup_1 = __importDefault(require("../config/configSetup"));
const sendSMS = (phone, code) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios.post(
    // `https://account.kudisms.net/api/?username=anthony@martlines.ng&password=sirador@101&message=${code} is your Martline access. Do not share this with anyone.&sender=Martline&mobiles=${req.params.phone}`,
    `https://termii.com/api/sms/send`, {
        "to": `${phone}`,
        "from": "N-Alert",
        "sms": `${code} is your Ace-Pick access code. Do not share this with anyone.`,
        "type": "plain",
        "channel": "dnd",
        "api_key": "TL2ofq7ayT0gl1h8r1xEXXCGW6C9VYORpdJjRuJ2xBsFxTGO1mEM6qP8FORHPO",
    }, {
        headers: {
            'Content-Type': ['application/json', 'application/json']
        }
    });
    if (response.status <= 300) {
        return {
            status: true,
            message: response.data,
        };
    }
    else {
        return {
            status: false,
            message: response.data,
        };
    }
});
exports.sendSMS = sendSMS;
const resend = new resend_1.Resend(configSetup_1.default.RESEND);
const sendEmailResend = (email, subject, template) => __awaiter(void 0, void 0, void 0, function* () {
    resend.emails.send({
        from: 'app@foodtruck.express',
        to: `${email}`,
        subject: `${subject}`,
        html: `${template}`
    });
});
exports.sendEmailResend = sendEmailResend;
const sendEmail = (email, code) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios.post(
    // `https://account.kudisms.net/api/?username=anthony@martlines.ng&password=sirador@101&message=${code} is your Martline access. Do not share this with anyone.&sender=Martline&mobiles=${req.params.phone}`,
    `https://api.ng.termii.com/api/email/otp/send`, {
        "email_address": `${email}`,
        "code": `${code}`,
        "email_configuration_id": "8c7bdde9-b886-4024-9a63-1218350d9bae",
        "api_key": "TL2ofq7ayT0gl1h8r1xEXXCGW6C9VYORpdJjRuJ2xBsFxTGO1mEM6qP8FORHPO",
    }, {
        headers: {
            'Content-Type': ['application/json', 'application/json']
        }
    });
    if (response.status <= 300) {
        return {
            status: true,
            message: response.data,
        };
    }
    else {
        return {
            status: false,
            message: response.data,
        };
    }
});
exports.sendEmail = sendEmail;
//# sourceMappingURL=sms.js.map