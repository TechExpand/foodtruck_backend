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
exports.sendToken = void 0;
const Users_1 = require("../models/Users");
var admin = require("firebase-admin");
const { getMessaging } = require('firebase-admin/messaging');
var serviceAccount = require("../keys/key.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const sendToken = (id, title, body) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield Users_1.Users.findOne({ where: { id } });
    const message = {
        notification: {
            title,
            body
        },
        data: {
            score: '850',
            time: '2:45'
        },
        token: user === null || user === void 0 ? void 0 : user.fcmToken,
    };
    getMessaging().send(message)
        .then((response) => {
        console.log('Successfully sent message:', response);
        return { message: response, status: true };
    })
        .catch((error) => {
        console.log('Error sending message:', error);
        return { message: error, status: false };
    });
});
exports.sendToken = sendToken;
//# sourceMappingURL=notification.js.map