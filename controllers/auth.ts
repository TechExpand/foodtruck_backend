import { createRandomRef, errorResponse, randomId, successResponse, validateEmail } from "../helpers/utility";
import { Request, Response } from 'express';
import { VerificationType, Verify } from "../models/Verify";
import { sendEmailResend, sendSMS } from "../services/sms";
import { Op, where } from "sequelize";
import { UserType, Users } from "../models/Users";
const TOKEN_SECRET = "222hwhdhnnjduru838272@@$henncndbdhsjj333n33brnfn";
const saltRounds = 10;
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { templateEmail } from "../config/template";
import { Profile } from "../models/Profile";
const nodemailer = require("nodemailer")
// import { Professional } from "../models/Professional";



export const sendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  const serviceId = randomId(12);
  const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
  console.log(codeEmail)

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
      const user = await Users.findOne({ where: { email: verifyEmail.client!.toString() } })
      const profile = await Profile.findOne({ where: { userId: user!.id } })
      if(profile){
        await sendEmailResend(verifyEmail.client!.toString(), `Welcome to Foodtruck.Express`,
         
        templateEmail('Welcome to Foodtruck.Express',
            `Welcome aboard the FoodTruck Express community! 🎉<br><br>


       Your account has been successfully created, and you are now part of a vibrant community.<br>
       
       
       Welcome aboard, food truck operators! We're thrilled to have you on board and excited to help you connect with hungry customers in your area.  <br>With real-time access to your location through our app, you'll attract hungry customers like never before. Let's hit the road together and bring the joy of delicious food to every corner of the city!<br>
       
       Here's what you can expect with foodtruck.express:<br><br>
       Reach a wider audience 🌟: Showcase your mouthwatering dishes to a vast audience of hungry app users craving fantastic street eats.<br>
       
       Effortless management 📲: Easily update your menu, location, and operating hours through our user-friendly app.<br>
       
       Increase sales 💰: Harness the power of our integrated location system, enabling customers to easily find and flock to your truck.<br>
       
       Cultivate your brand 🌱: Cultivate your reputation with valuable customer feedback, participate in curated events, and host your own promotions to captivate an even larger audience of food truck enthusiasts.<br><br>
       
       Ready to Roll?<br><br>
       
       Once you  familiarize yourself with the platform, update your profile with your delicious menu. Let your social followers know that they can now find you in real time with the FoodTruck.Express platform!   We can't wait to see you hitting the streets and serving up amazing food!<br><br>
       
       
       Have questions?<br><br>
       
       
       Our dedicated support team is always happy to help. Feel free to reach out to us at support@foodtruck.express anytime. Welcome to the Foodtruck.Express family!<br>
       
       
        Best, The Foodtruck.Express Team<br><br>`));
      }else{
        await sendEmailResend(verifyEmail.client!.toString(), `Welcome to Foodtruck.Express`,   templateEmail('Welcome to Foodtruck.Express',
          `Welcome aboard the FoodTruck Express community! 🎉<br><br>
          
          
          Your account has been successfully created, and you are now part of a vibrant community.<br><br>
          
          
          We’re thrilled to have you join us on this exciting culinary adventure. Get ready to discover, order, and savor the best food truck experiences in your city!<br><br>
          
          
          Here's a quick guide to kickstart your FoodTruck.Express journey:<br>
          🚚 Locate & Love: Use our app to find your favorite food trucks on the move. Whether you’re craving tacos, pizza, or something exotic, we’ve got you covered.<br>
          
          🌮 Share the Love: Have a fantastic experience? Share the FoodTruck Express love with friends and family. The more, the merrier!<br>
          
          🎉 Exclusive Updates: Stay in the loop! Receive updates on citywide food truck events and exclusive offers. Don’t miss out on any flavor-filled festivities.<br>
          
          Feel free to explore, share, and let us know how we can make your FoodTruck Express experience even better. Your feedback matters!<br><br>
          
          
          Happy exploring and happy eating!<br><br>
          
          
          Best, The FoodTruck Express Team 🍔🍕🌯<br><br>
          
          
          P.S. Spread the word! Tell your friends about FoodTruck Express and let’s build a community of foodies together. Sharing is caring!<br>`) 
         )
      }
    
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
  return res.status(200).send({ message: true, serviceId })
}








export const login = async (req: Request, res: Response) => {
  let { email, password } = req.body;
  const user = await Users.findOne({ where: { email } })
  if (!user) return errorResponse(res, "Failed", { status: false, message: "User does not exist" })
  const match = await compare(password, user.password)
  if (!match) return errorResponse(res, "Failed", { status: false, message: "Invalid Credentials" })
  let token = sign({ id: user.id, email: user.email }, TOKEN_SECRET);
  return res.status(200).send({ token, type: user.type })
}






export const passwordChange = async (req: Request, res: Response) => {
  let { newPassword, email } = req.body;
  const user = await Users.findOne({ where: { email } })
  if (!user) return errorResponse(res, "Failed", { status: false, message: "User does not exist" })

  hash(newPassword, saltRounds, async function (err, hashedPassword) {
    await user.update({ password: hashedPassword })
    let token = sign({ id: user.id, email: user.email }, TOKEN_SECRET);
    return successResponse(res, "Successful", { status: true, message: { ...user.dataValues, token } })
  })

}


