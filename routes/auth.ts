




// Import packages
import { Router } from 'express';
import {  createProfile, updateLocation } from '../controllers';
import {  googleLogin, googleRegister, login, passwordChange, sendOtp, validateReg, verifyOtp } from '../controllers/auth';

const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.post('/send-otp', sendOtp);
routes.post('/change-password', passwordChange);
routes.post('/verify-otp', verifyOtp);
routes.post('/google/register', googleRegister);
routes.post('/google/login', googleLogin);


routes.post('/token/login/', login);
routes.post('/users/validate/', validateReg)
routes.post('/lanlog', updateLocation);
routes.post('/createprofile/',  createProfile)

export default routes;
