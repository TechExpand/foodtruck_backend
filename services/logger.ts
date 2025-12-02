import config from "../config/configSetup";
import winston from "winston";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";

const logtail = new Logtail(config.BETTER_STACK_APIKEY as string, {
  endpoint: config.BETTER_STACK_ENDPOINT,
});

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
  winston.format.prettyPrint(),
  winston.format.errors({ stack: true })
);
const transports = [
  // new winston.transports.Console({
  //   format: winston.format.combine(logFormat),
  // }),
  new LogtailTransport(logtail),
];

const logger = winston.loggers.add("logger", {
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

export default logger;
