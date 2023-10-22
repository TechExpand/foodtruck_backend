const axios = require("axios");


export const sendSMS = async (phone: number, code: string)=>{
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
        return  {
          status: false,
          message: response.data,
        };
      }
}






export const sendEmail = async (email: string, code: string)=>{
    const response = await axios.post(
        // `https://account.kudisms.net/api/?username=anthony@martlines.ng&password=sirador@101&message=${code} is your Martline access. Do not share this with anyone.&sender=Martline&mobiles=${req.params.phone}`,
        `https://api.ng.termii.com/api/email/otp/send`,
        {
          "email_address": `${email}`,
          "code": `${code}`,
          "email_configuration_id": "8c7bdde9-b886-4024-9a63-1218350d9bae",
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
        return  {
          status: false,
          message: response.data,
        };
      }
}