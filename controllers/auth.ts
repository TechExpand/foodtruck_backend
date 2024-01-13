import { createRandomRef, errorResponse, randomId, successResponse, validateEmail } from "../helpers/utility";
import { Request, Response } from 'express';
import { VerificationType, Verify } from "../models/Verify";
import { sendEmail, sendEmailResend, sendSMS } from "../services/sms";
import { Op, where } from "sequelize";
import { Users } from "../models/Users";
const TOKEN_SECRET = "222hwhdhnnjduru838272@@$henncndbdhsjj333n33brnfn";
const saltRounds = 10;
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { templateEmail } from "../config/template";
const nodemailer = require("nodemailer")
// import { Professional } from "../models/Professional";



export const sendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  const serviceId = randomId(12);
  const codeEmail = String(Math.floor(1000 + Math.random() * 9000));

  await Verify.create({
    serviceId,
    code: codeEmail,
    client: email,
    secret_key: createRandomRef(12, "foodtruck",),
  })
  const emailResult = await sendEmailResend(email, "Foodtruck otp code", templateEmail("OTP CODE", codeEmail.toString()));
  return successResponse(res, "Successful", { serviceId })
};






export const verifyOtp = async (req: Request, res: Response) => {
  const { serviceId, emailCode } = req.body;


  const verifyEmail = await Verify.findOne({
    where: {
      serviceId
    }
  })

  if (verifyEmail) {

    if (verifyEmail.code === emailCode) {

      const verifyEmailResult = await Verify.findOne({ where: { id: verifyEmail.id } })
      await verifyEmailResult?.destroy()
      return successResponse(res, "Successful", {
        message: "successful",
        status: true
      })

    } else {

      errorResponse(res, "Failed", {
        message: "Invalid Email Code",
        status: false
      })
    }
  } else {
    errorResponse(res, "Failed", {
      message: "Email Code Already Used",
      status: false
    })
  }
}




export const register = async (req: Request, res: Response) => {
  const { email, password, type } = req.body;
  hash(password, saltRounds, async function (err, hashedPassword) {
    const userExist = await Users.findOne({ where: { email } })
    if (!validateEmail(email)) return res.status(400).send({ email: ["Enter a valid email"] })
    else if (password.toString() <= 6) return res.status(400).send({ password: ["Password should be greater than 6 digits"] })
    else if (userExist) return res.status(400).send({ email: ["Email already exist"] })
    //  else if(userExist) return errorResponse(res, "Failed", {status: false, message: "Email/Phone already exist"})
    const user = await Users.create({
      email, password: hashedPassword, type
    })
    let token = sign({ id: user.id, email: user.email }, TOKEN_SECRET);
    return res.status(200).send({ token })
  });
}






export const validateReg = async (req: Request, res: Response) => {
  const { email, password, type } = req.body;
  const userExist = await Users.findOne({ where: { email }, })
  if (!validateEmail(email)) return res.status(400).send({ email: ["Enter a valid email"], message: false })
  else if (password.toString() <= 6) return res.status(400).send({ password: ["Password should be greater than 6 digits"], message: false })
  else if (userExist) return res.status(400).send({ email: ["Email already exist"], message: false })
  const serviceId = randomId(12);
  const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
  await Verify.create({
    serviceId,
    code: codeEmail,
    client: email,
    secret_key: createRandomRef(12, "foodtruck",),
  })
  const emailResult = await sendEmailResend(email, "Foodtruck otp code", templateEmail("OTP CODE", codeEmail.toString()));
  // return successResponse(res, "Successful", { serviceId })
  return res.status(200).send({ message: true , serviceId})
}





// let transporter = nodemailer.createTransport({
//   host: "wingudigital.com",
//   port:  465,
//   // 587
//   auth: {
//     user: "app@wingudigital.com",
//     pass: "o30cnK68_"
//   }
//   });


export const register2 = async (req: Request, res: Response) => {
  const { email } = req.query;
  console.log(email)
  await sendEmailResend(email!.toString(), 'Welcome to Foodtruck.Express', `<p>Just a test</p>`);
  res.send({ message: "message sent" })
  // transporter.sendMail(mailOptions, function(err:any, data:any) {
  //     if (err) {
  //       console.log("Error " + err);
  //       res.send({message: err})
  //     } else {
  //       console.log("Email sent successfully");
  //       res.send({message: "message sent"})
  //     }
  //   });
}





export const login = async (req: Request, res: Response) => {
  let { email, password } = req.body;
  console.log(email)
  console.log(password)
  const user = await Users.findOne({ where: { email } })
  console.log(user)
  if (!user) return errorResponse(res, "Failed", { status: false, message: "User does not exist" })
  const match = await compare(password, user.password)
  if (!match) return errorResponse(res, "Failed", { status: false, message: "Invalid Credentials" })
  let token = sign({ id: user.id, email: user.email }, TOKEN_SECRET);
  return res.status(200).send({ token })
}






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





export const passwordChange = async (req: Request, res: Response) => {
  let {  newPassword, email } = req.body;
  const user = await Users.findOne({ where: { email } })
  if (!user) return errorResponse(res, "Failed", { status: false, message: "User does not exist" })

  hash(newPassword, saltRounds, async function (err, hashedPassword) {
    await user.update({ password: hashedPassword })
    let token = sign({ id: user.id, email: user.email }, TOKEN_SECRET);
    return successResponse(res, "Successful", { status: true, message: { ...user.dataValues, token } })
  })

}


