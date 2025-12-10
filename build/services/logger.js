"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configSetup_1 = __importDefault(require("../config/configSetup"));
const winston_1 = __importDefault(require("winston"));
const node_1 = require("@logtail/node");
const winston_2 = require("@logtail/winston");
const logtail = new node_1.Logtail(configSetup_1.default.BETTER_STACK_APIKEY, {
    endpoint: configSetup_1.default.BETTER_STACK_ENDPOINT,
});
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json(), winston_1.default.format.prettyPrint(), winston_1.default.format.errors({ stack: true }));
const transports = [
    // new winston.transports.Console({
    //   format: winston.format.combine(logFormat),
    // }),
    new winston_2.LogtailTransport(logtail),
];
const logger = winston_1.default.loggers.add("logger", {
    level: "info",
    format: logFormat,
    transports,
    defaultMeta: {
        service: "logger",
    },
});
// class logger{
//   static info(message: any, meta?: any) {
//     // console.log(message)
//   }
//   static error(message: any, meta?: any) {
//     // console.error(message)
//   }
//   static warn(message: any, meta?: any) {
//     // console.warn(message)
//   }
// }
exports.default = logger;
//# sourceMappingURL=logger.js.map