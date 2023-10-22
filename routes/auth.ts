




// Import packages
import { Router } from 'express';
import { apiIndex, createLocation, createProfile } from '../controllers';
import { changePassword, login, register, sendOtp, verifyOtp } from '../controllers/auth';
import { uploads } from '../helpers/upload';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.post('/send-otp', sendOtp);
routes.post('/change-password', changePassword);
routes.post('/verify-otp', verifyOtp);


routes.post('/token/login/', login);
routes.post('/users/', register);
routes.post('/lanlog/', createLocation);
routes.post('/createprofile/', uploads.single("pro_pic"), createProfile)

export default routes;
