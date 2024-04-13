




// Import packages
import { Router } from 'express';
import { apiIndex, createLocation, createProfile } from '../controllers';
import {  login, passwordChange, register, sendOtp, validateReg, verifyOtp } from '../controllers/auth';
import { uploads } from '../helpers/upload';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.post('/send-otp', sendOtp);
routes.post('/change-password', passwordChange);
routes.post('/verify-otp', verifyOtp);


routes.post('/token/login/', login);
routes.post('/users/', register);
routes.post('/users/validate/', validateReg)
routes.post('/lanlog', createLocation);
routes.post('/createprofile/', uploads.single("pro_pic"), createProfile)

export default routes;
