import { createRandomRef, errorResponse, randomId, successResponse, validateEmail } from "../helpers/utility";
import { Request, Response } from 'express';
import { VerificationType, Verify } from "../models/Verify";
import { sendEmail, sendSMS } from "../services/sms";
import { Op, where } from "sequelize";
import { Users } from "../models/Users";
const TOKEN_SECRET = "222hwhdhnnjduru838272@@$henncndbdhsjj333n33brnfn";
const saltRounds = 10;
import {compare, hash} from "bcryptjs";
import {sign} from "jsonwebtoken";
const nodemailer =  require("nodemailer")
// import { Professional } from "../models/Professional";



export const sendOtp = async (req: Request, res: Response)=>{
    const { email, phone, type} = req.body;
    const serviceId = randomId(12);
    const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
    const codeSms = String(Math.floor(1000 + Math.random() * 9000));

    if(type == VerificationType.BOTH){
        await Verify.create({
            serviceId,
            code:codeSms
          })
          await Verify.create({
              serviceId,
              code:codeEmail
            })
             const smsResult = await sendSMS(phone, codeSms.toString());
             const emailResult = await sendEmail(email, codeEmail.toString())
             if(smsResult.status && emailResult.status) return successResponse(res, "Successful", {...smsResult, serviceId})
             return errorResponse(res, "Failed", emailResult)
    }else if(type == VerificationType.SMS){
        await Verify.create({
            serviceId,
            code:codeSms
          })
          const smsResult = await sendSMS(phone, codeSms.toString());
          if(smsResult.status) return successResponse(res, "Successful", {...smsResult, serviceId})
          return errorResponse(res, "Failed", smsResult)
    }else{
          await Verify.create({
            serviceId,
            code:codeEmail,
            client: email,
            secret_key: createRandomRef(12, "ace_pick",),
          })
          const emailResult = await sendEmail(email, codeEmail.toString());
          if(emailResult.status) return successResponse(res, "Successful", {...emailResult, serviceId})
          return errorResponse(res, "Failed", emailResult)

    }
  
};






export const verifyOtp = async (req: Request, res: Response)=>{
    const { serviceId, smsCode, emailCode, type } = req.body;


    if(type == VerificationType.BOTH){
        const verifySms = await  Verify.findOne({
            where:{
             [Op.or]: [
                 {serviceId},
                 {code: smsCode}
             ]
            }
           })
     
           const verifyEmail =  await Verify.findOne({
                where:{
                 [Op.or]: [
                     {serviceId},
                     {code: emailCode}
                 ]
                }
           })
     
           if (verifyEmail && verifySms) {
          
             if (verifyEmail.code === emailCode   && verifySms.code === smsCode || verifyEmail.code === smsCode   && verifySms.code === emailCode) {
               const verifyEmailResult =  await  Verify.findOne({ where:{ id: verifyEmail.id} })
               const verifySmsResult =  await Verify.findOne({ where:{ id: verifySms.id} })
              await  verifyEmailResult?.destroy()
              await  verifySmsResult?.destroy()
              return  successResponse(res, "Successful", {
                 message: "successful",
                 status: true
               })
             }else{
                     console.log(verifyEmail.code);
                     console.log(emailCode);
                   errorResponse(res, "Failed", {
                     message: "Invalid Code",
                     status: false
                   })
             }
           }else {
             console.log(verifyEmail);
             console.log(verifySms);
               errorResponse(res, "Failed", {
                 message: "Code Already Used",
                 status: false
               })
             }
    }else if(type == VerificationType.SMS){
        const verifySms = await  Verify.findOne({
            where:{
                serviceId
            }
           })

           if (verifySms) {
          
            if (verifySms.code === smsCode) {
            
              const verifySmsResult =  await Verify.findOne({ where:{ id: verifySms.id} })
             await  verifySmsResult?.destroy()
             return  successResponse(res, "Successful", {
                message: "successful",
                status: true
              })

            }else{
                  
                  errorResponse(res, "Failed", {
                    message: "Invalid Sms Code",
                    status: false
                  })
            }
          }else {
              errorResponse(res, "Failed", {
                message: "Sms Code Already Used",
                status: false
              })
            }
    }else if(type == VerificationType.EMAIL){
        const verifyEmail = await  Verify.findOne({
            where:{
                serviceId
           
            }
           })

           if (verifyEmail) {
          
            if (verifyEmail.code === smsCode) {
            
              const verifyEmailResult =  await Verify.findOne({ where:{ id: verifyEmail.id} })
             await  verifyEmailResult?.destroy()
             return  successResponse(res, "Successful", {
                message: "successful",
                status: true
              })

            }else{
                  
                  errorResponse(res, "Failed", {
                    message: "Invalid Email Code",
                    status: false
                  })
            }
          }else {
              errorResponse(res, "Failed", {
                message: "Email Code Already Used",
                status: false
              })
            }
    }else{
        const verifyEmail = await  Verify.findOne({
            where:{
                serviceId
          
            }
           })

           if (verifyEmail || verifyEmail!.used) {
          
            if (verifyEmail!.code === smsCode) {
            
              const verifyEmailResult =  await Verify.findOne({ where:{ id: verifyEmail!.id} })
             await  verifyEmailResult?.update({used: true})

             return  successResponse(res, "Successful", {
                message: "successful",
                status: true,
                secret_key: verifyEmailResult?.secret_key
              })

            }else{
                  
                  errorResponse(res, "Failed", {
                    message: "Invalid Email Code",
                    status: false
                  })
            }
          }else {
              errorResponse(res, "Failed", {
                message: "Email Code Already Used",
                status: false
              })
            }
    }

    



}




export const register = async (req: Request, res: Response)=>{
    const {email, password, type} = req.body;
    hash(password, saltRounds, async function (err, hashedPassword) {
       const userExist = await Users.findOne({where:{ email}})
         if (!validateEmail(email)) return res.status(400).send({email:["Enter a valid email"]})
         else if (password.toString() <= 6) return res.status(400).send({password:["Password should be greater than 6 digits"]})
         else if(userExist) return res.status(400).send({email:["Email already exist"]})
        //  else if(userExist) return errorResponse(res, "Failed", {status: false, message: "Email/Phone already exist"})
         const user = await Users.create({
         email, password: hashedPassword, type})
         let token = sign({ id: user.id, email: user.email }, TOKEN_SECRET);
         return res.status(200).send({token})
    });
}



let transporter = nodemailer.createTransport({
  host: "smtp.foodtruck.express",
  port: 25,
  auth: {
    user: "support@foodtruck.express",
    pass: "9Ak79j9%b"
  }
  });


export const register2 = async (req: Request, res: Response)=>{
  let mailOptions = {
    from: "support@foodtruck.express",
    to: req.params.email,
    subject: 'Welcome to Foodtruck.Express',
    html: 
    `Just a test`
  };



transporter.sendMail(mailOptions, function(err:any, data:any) {
    if (err) {
      console.log("Error " + err);
      res.send({message: err})
    } else {
      console.log("Email sent successfully");
      res.send({message: "message sent"})
    }
  });
}





export const login = async (req: Request, res: Response)=>{
    let { email, password} = req.body;
    console.log(email)
    console.log(password)
    const user = await Users.findOne({ where:{ email }})
    console.log(user)
    if (!user) return errorResponse(res, "Failed", {status: false, message: "User does not exist"})
    const match =  await compare(password, user.password)
    if (!match) return errorResponse(res, "Failed", {status: false, message: "Invalid Credentials"})
    let token = sign({ id: user.id, email: user.email }, TOKEN_SECRET);
    return res.status(200).send({token})
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





export const changePassword = async (req: Request, res: Response)=>{
    const { password ,secret_key} = req.body;
       const verify =  await Verify.findOne(
            {where:{
                secret_key,
                used: true
            }}
        )
        if(!verify) return errorResponse(res, "Failed", {status: false, message: "Invalid Client Secret"})
        hash(password, saltRounds, async function (err, hashedPassword) {
            const user = await Users.findOne({where:{email: verify.client}});
            user?.update({password: hashedPassword})
            let token = sign({ id: user!.id, email: user!.email }, TOKEN_SECRET);
            await verify.destroy()
            return successResponse(res, "Successful", {...user?.dataValues, token})
         });
};

