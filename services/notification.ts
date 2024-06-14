import { Users } from "../models/Users";
var admin = require("firebase-admin");
const { getMessaging } = require('firebase-admin/messaging');

var serviceAccount = require("../keys/key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});




export const sendToken = async (id:number, title: string, body: string) => {
   const user = await Users.findOne({ where: {id}});
   
        const message = {
          notification: {
            title,
            body
          },
          data: {
            score: '850',
            time: '2:45'
          },
          token: user?.fcmToken,
        };
        getMessaging().send(message)
          .then((response:any) => {
            console.log('Successfully sent message:', response);
            return { message: response , status: true};
          })
          .catch((error:any) => {
            console.log('Error sending message:', error);
            return { message: error , status: false};
          })}
  
  