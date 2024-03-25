const axios = require("axios");
import { Resend } from 'resend';
import config from '../config/configSetup';
const nodemailer = require("nodemailer");


export const sendSMS = async (phone: number, code: string) => {
  const response = await axios.post(
    // `https://account.kudisms.net/api/?username=anthony@martlines.ng&password=sirador@101&message=${code} is your Martline access. Do not share this with anyone.&sender=Martline&mobiles=${req.params.phone}`,
    `https://termii.com/api/sms/send`,
    {
      "to": `${phone}`,
      "from": "N-Alert",
      "sms": `${code} is your Ace-Pick access code. Do not share this with anyone.`,
      "type": "plain",
      "channel": "dnd",
      "api_key": "TL2ofq7ayT0gl1h8r1xEXXCGW6C9VYORpdJjRuJ2xBsFxTGO1mEM6qP8FORHPO",
    },
    {
      headers: {
        'Content-Type': ['application/json', 'application/json']
      }
    }
  );

  if (response.status <= 300) {
    return {
      status: true,
      message: response.data,
    }
  } else {
    return {
      status: false,
      message: response.data,
    };
  }
}



// const resend = new Resend(config.RESEND);
// export const sendEmailResend = async (email: String, subject: String, template: String) => {
//   resend.emails.send({
//     from: 'app@foodtruck.express',
//     to: `${email}`,
//     subject: `${subject}`,
//     html: `${template}`
//   });
// }




// export const sendEmail = async (email: string, code: string) => {
//   const response = await axios.post(
//     // `https://account.kudisms.net/api/?username=anthony@martlines.ng&password=sirador@101&message=${code} is your Martline access. Do not share this with anyone.&sender=Martline&mobiles=${req.params.phone}`,
//     `https://api.ng.termii.com/api/email/otp/send`,
//     {
//       "email_address": `${email}`,
//       "code": `${code}`,
//       "email_configuration_id": "8c7bdde9-b886-4024-9a63-1218350d9bae",
//       "api_key": "TL2ofq7ayT0gl1h8r1xEXXCGW6C9VYORpdJjRuJ2xBsFxTGO1mEM6qP8FORHPO",
//     },
//     {
//       headers: {
//         'Content-Type': ['application/json', 'application/json']
//       }
//     }
//   );

//   if (response.status <= 300) {
//     return {
//       status: true,
//       message: response.data,
//     }
//   } else {
//     return {
//       status: false,
//       message: response.data,
//     };
//   }
// }


let transporter = nodemailer.createTransport({
  host: "server1.wingudigital.com",
  port: 465,
  auth: {
    user: "smtpizzle@foodtruck.express",
    pass: "NfzRa5ghz8H"
  }
});



export const sendEmailResend = async (email: String, subject: String, template: String) => {
  let mailOptions = {
    from: "smtpizzle@foodtruck.express",
      to: `${email}`,
      subject: `${subject}`,
      html: `${template}`
  };

  transporter.sendMail(mailOptions, function (err: any, data: any) {
    console.log("loading....")
    try {
      if (err) {
        console.log("Error " + err);
        return { message: err }
      } else {
        console.log("Email sent successfully");
        return { message: "message sent" }
      }
    } catch (e) {
      console.log("Error " + e);
      return { message: e }
    }
  })
}
