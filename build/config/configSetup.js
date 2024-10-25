"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const getConfig = () => {
    return {
        NODE_ENV: process.env.NODE_ENV,
        PORT: Number(process.env.PORT),
        SSL: true,
        JWTSECRET: process.env.JWTSECRET,
        JWT_EXPIRY_TIME: process.env.JWT_EXPIRY_TIME,
        DBNAME: process.env.DBNAME,
        STRIPE_SK: process.env.STRIPE_SK,
        DBUSERNAME: process.env.DBUSERNAME,
        DBPASSWORD: process.env.DBPASSWORD,
        DBHOST: process.env.DBHOST,
        DBPORT: Number(process.env.DBPORT),
        RESEND: process.env.RESEND,
        DBDIALECT: process.env.DBDIALECT,
        MAIL_FROM: process.env.MAIL_FROM,
        PRICE_ID: process.env.PRICE_ID,
        SUPPORT_MAIL: process.env.SUPPORT_MAIL,
        SUPPORT_PHONE: process.env.SUPPORT_PHONE,
        MAIL_FROM_NAME: process.env.MAIL_FROM_NAME,
        LOGO: process.env.LOGO,
        WEBSITE: process.env.WEBSITE,
        BASE_API_URL: process.env.BASE_API_URL,
        REDIS_INSTANCE_URL: process.env.REDIS_INSTANCE_URL,
        PUBLIC_ROUTES: [
            "/foodtruck/users/",
            "/foodtruck/",
            '/foodtruck/alltags',
            '/foodtruck/search',
            '/foodtruck/get-home-details',
            '/foodtruck/currentvendorslanlog',
            '/foodtruck/locationprofile',
            '/foodtruck/locationevent',
            '/foodtruck/locationmenu',
            "/foodtruck/email/",
            "/foodtruck/users/validate/",
            '/foodtruck/verify-otp',
            '/foodtruck/send-otp',
            '/foodtruck/change-password',
            // '/foodtruck/lanlog',
            "/foodtruck/token/login/"
        ],
        BUSINESS_PUBLIC_ROUTES: [],
    };
};
const getSanitzedConfig = (config) => {
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            throw new Error(`Missing key ${key} in .env`);
        }
    }
    return config;
};
const config = getConfig();
const sanitizedConfig = getSanitzedConfig(config);
exports.default = sanitizedConfig;
//# sourceMappingURL=configSetup.js.map