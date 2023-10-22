// Import packages
import { Router } from 'express';
import { apiIndex, cancelSubscription, createMenu, createSubscription, deleteMenu, getLanLog, getMenu, getProfile, getSubscription, getVendorProfile, onlineLanlogUser, onlineLanlogVendors, rateProfile, updateLanLog, updateMenu, updateProfile, vendorMenu } from '../controllers';
import { uploads } from '../helpers/upload';


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
routes.put('/profile', uploads.single("pro_pic"), updateProfile)
routes.get('/locationprofile', getProfile);
routes.get('/locationmenu', vendorMenu);
routes.get('/menu', getMenu);
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
