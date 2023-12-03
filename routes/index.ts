// Import packages
import { Router } from 'express';
import { apiIndex, cancelSubscription, createMenu, createSubscription, deleteMenu, getFirstFiveEvents, getLanLog, getMenu, getProfile, getSubscription, getTags, getVendorProfile, onlineLanlogUser, onlineLanlogVendors, rateProfile, updateLanLog, updateMenu, updateProfile, vendorMenu } from '../controllers';
import { uploads } from '../helpers/upload';
import { register2 } from '../controllers/auth';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.get('/', apiIndex);
routes.get('/createsubscription', createSubscription);
routes.get('/currentvendorslanlog', onlineLanlogVendors);
routes.get('/currentuserlanlog', onlineLanlogUser);
routes.get('/profile', getVendorProfile);
routes.get('/email', register2);
routes.put('/profile', uploads.single("pro_pic"), updateProfile)
routes.get('/locationprofile', getProfile);
routes.get('/locationmenu', vendorMenu);
routes.get('/menu', getMenu);
routes.get('/get-events', getFirstFiveEvents)
routes.get('/get-popular', getFirstFiveEvents)
routes.get('/get-tags', getTags)
routes.delete('/menu/:id', deleteMenu);
routes.post('/menu', uploads.single("menu_picture1"), createMenu);
routes.put('/menu/:id', uploads.single("menu_picture1"), updateMenu);
routes.post("/rating", rateProfile)
routes.get("/lanlog", getLanLog)
routes.get("/subscription", getSubscription)
routes.get("/cancelsubscription", cancelSubscription)
routes.get('/activesubscription', createSubscription);


routes.put("/lanlog", updateLanLog)







export default routes;
