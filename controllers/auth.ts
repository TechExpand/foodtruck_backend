import {
  createRandomRef,
  errorResponse,
  randomId,
  successResponse,
  validateEmail,
} from "../helpers/utility";
import { Request, Response } from "express";
import { VerificationType, Verify } from "../models/Verify";
import { sendEmailResend, sendSMS } from "../services/sms";
import { UserType, Users } from "../models/Users";
const TOKEN_SECRET = "222hwhdhnnjduru838272@@$henncndbdhsjj333n33brnfn";
const saltRounds = 10;
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";


import {
  templateEmail,
  userWelcomeTemplate,
  vendorWelcomeTemplate,
} from "../config/template";
import { admin } from "../services/notification";
import axios from "axios";
const nodemailer = require("nodemailer");
// import { Professional } from "../models/Professional";

export const sendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  const serviceId = randomId(12);
  const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
  console.log(codeEmail);
  console.log(codeEmail);

  await Verify.create({
    serviceId,
    code: codeEmail,
    client: email,
    secret_key: createRandomRef(12, "foodtruck"),
  });
  const emailResult = await sendEmailResend(
    email,
    "Foodtruck otp code",
    templateEmail("OTP CODE", codeEmail.toString())
  );
  return successResponse(res, "Successful", { serviceId });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { serviceId, emailCode, type, password } = req.body;

  const verifyEmail = await Verify.findOne({
    where: {
      serviceId,
    },
  });

  if (verifyEmail) {
    if (verifyEmail.code === emailCode) {
      const verifyEmailResult = await Verify.findOne({
        where: { id: verifyEmail.id },
      });
      if(verifyEmailResult?.otpType === "FORGET"){
        hash(password, saltRounds, async function (err, hashedPassword) {
          const userExist = await Users.findOne({ where: { email: verifyEmailResult?.client as string } });
          const user = await userExist?.update({
            password: hashedPassword,
          });
          await verifyEmailResult?.destroy();
          let token = sign({ id: user?.id, email: user?.email }, TOKEN_SECRET);
          return successResponse(res, "Successful", token);
        });
      }else{
        if (type === UserType.USER) {
          await sendEmailResend(
            verifyEmail.client!.toString(),
            `Welcome to Foodtruck.Express`,
  
            templateEmail("Welcome to Foodtruck.Express", userWelcomeTemplate())
          );
        } else {
          await sendEmailResend(
            verifyEmail.client!.toString(),
            `Welcome to Foodtruck.Express`,
            templateEmail("Welcome to Foodtruck.Express", vendorWelcomeTemplate())
          );
        }
        hash(password, saltRounds, async function (err, hashedPassword) {
          const userExist = await Users.findOne({ where: { email:  verifyEmailResult?.client as string } });
          if (!validateEmail( verifyEmailResult?.client as string)) return errorResponse(res, "Enter a valid email");
          else if (userExist) return errorResponse(res, "Email already exist");
          const user = await Users.create({
            username: verifyEmailResult?.username,
            email: verifyEmailResult?.client as string,
            password: hashedPassword,
            type,
          });
          await verifyEmailResult?.destroy();
          let token = sign({ id: user.id, email: user.email }, TOKEN_SECRET);
          return successResponse(res, "Successful", token);
        });
      }

    } else {
      errorResponse(res, "Invalid Email Code", {
        message: "Invalid Email Code",
        status: false,
      });
    }
  } else {
    errorResponse(res, "Email Code Already Used", {
      message: "Email Code Already Used",
      status: false,
    });
  }
};






export const googleLogin = async (req: Request, res: Response) => {
  let { accessToken, type, fcmToken } = req.body;
  const response = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const user = await Users.findOne({ where: { email: response?.data?.email} });
  if (!user) return errorResponse(res, "User does not exist");
  if(user.type != UserType.VENDOR && type == UserType.VENDOR) return errorResponse(res, "You don't have access to a Vendor Account");
  const match = await compare(response?.data?.id, user.password);
  if (!match) return errorResponse(res, "Invalid Credentials");
  let token = sign({ id: user.id, email: user.email }, TOKEN_SECRET);
  await user.update({fcmToken})
  return successResponse(res, "Success login", { token, type: user.type });
};


export const googleRegister = async (req: Request, res: Response) => {
  const { accessToken, type } = req.body;
  const response = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
        if (type === UserType.USER) {
          await sendEmailResend(
            response?.data?.email.toString(),
            `Welcome to Foodtruck.Express`,
  
            templateEmail("Welcome to Foodtruck.Express", userWelcomeTemplate())
          );
        } else {
          await sendEmailResend(
            response?.data?.email.toString(),
            `Welcome to Foodtruck.Express`,
            templateEmail("Welcome to Foodtruck.Express", vendorWelcomeTemplate())
          );
        }
        hash(response?.data?.id, saltRounds, async function (err, hashedPassword) {
          const userExist = await Users.findOne({ where: { email: response?.data?.email } });
          if (!validateEmail(response?.data?.email)) return errorResponse(res, "Enter a valid email");
          else if (userExist) return errorResponse(res, "Email already exist");
          const user = await Users.create({
            username: response?.data?.name,
            email: response?.data?.email as string,
            password: hashedPassword,
            type,
          });
          let token = sign({ id: user.id, email: user.email }, TOKEN_SECRET);
          return successResponse(res, "Successful", token);
        });
};



export const validateReg = async (req: Request, res: Response) => {
  const { email, password, type, username, otpType } = req.body;
  console.log(otpType)
  const userExist = await Users.findOne({ where: { email } });
  if (!validateEmail(email) && otpType!="FORGET") return errorResponse(res, "Enter a valid email");
  else if (password.toString() <= 6 && otpType!="FORGET")
    return errorResponse(res, "Password should be greater than 6 digits");
  else if (userExist && otpType!="FORGET") return errorResponse(res, "Email already exist");
  else if (!userExist && otpType==="FORGET") return errorResponse(res, "Email doesn't exist");
  const serviceId = randomId(12);
  const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
  console.log(codeEmail)
  await Verify.create({
    serviceId,
    code: codeEmail,
    client: email,
    username,
    otpType, 
    type,
    secret_key: createRandomRef(12, "foodtruck"),
  });
  const emailResult = await sendEmailResend(
    email,
    "Foodtruck otp code",
    templateEmail("OTP CODE", codeEmail.toString())
  );
  return successResponse(res, "Successful", serviceId);
};

export const login = async (req: Request, res: Response) => {
  let { email, password, type , fcmToken} = req.body;
  const user = await Users.findOne({ where: { email } });
  if (!user) return errorResponse(res, "User does not exist");
  console.log(user.type);
  if(user.type != UserType.VENDOR && type == UserType.VENDOR) return errorResponse(res, "You don't have access to a Vendor Account");
  const match = await compare(password, user.password);
  if (!match) return errorResponse(res, "Invalid Credentials");
  let token = sign({ id: user.id, email: user.email }, TOKEN_SECRET);
  await user.update({fcmToken})
  return successResponse(res, "Success login", { token, type: user.type });
};

export const passwordChange = async (req: Request, res: Response) => {
  let { newPassword, email, oldPassword } = req.body;
  const user = await Users.findOne({ where: { email } });
  if (!user) return errorResponse(res, "User does not exist");
  const match = await compare(oldPassword, user.password);
  if (!match) return errorResponse(res, "Invalid Credentials");
  hash(newPassword, saltRounds, async function (err, hashedPassword) {
    await user.update({ password: hashedPassword });
    let token = sign({ id: user.id, email: user.email }, TOKEN_SECRET);
    return successResponse(res, "Successful", {
      status: true,
      message: { ...user.dataValues, token },
    });
  });
};
