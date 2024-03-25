// Import packages
import { Router } from 'express';
import { apiIndex, cancelSubscription, createEvent, createMenu, createSubscription, deleteMenu, getAllTags, getFirstFiveEvents, getFirstFivePorpular, getHomeDetails, getLanLog, getMenu, getProfile, getSubscription, getTags, getUser, getVendorEvent, getVendorProfile, onlineLanlogUser, onlineLanlogVendors, rateProfile, sendTestEmailCon, updateEvent, updateLanLog, updateMenu, updateProfile, updateToken, vendorEvent, vendorMenu } from '../controllers';
import { uploads } from '../helpers/upload';
import { register2 } from '../controllers/auth';
import { deleteFavourite, getFavourite, getOrder, getp, notifyOrder, postFavourite, postOrder, search } from '../controllers/favourite';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.get('/', apiIndex);
routes.get('/createsubscription', createSubscription);
routes.get('/currentvendorslanlog', onlineLanlogVendors);
routes.get('/currentuserlanlog', onlineLanlogUser);
routes.get('/user', getUser);
routes.get('/alltags', getAllTags);
routes.get('/profile', getVendorProfile);
routes.get('/email', register2);
routes.put('/profile', uploads.single("pro_pic"), updateProfile)
routes.get('/locationprofile', getProfile);
routes.get('/locationmenu', vendorMenu);
routes.get('/locationevent', vendorEvent);
routes.get('/menu', getMenu);
routes.get('/get-home-details', getHomeDetails);
routes.get('/get-events', getFirstFiveEvents)
routes.get('/get-vendor-event', getVendorEvent)
routes.get('/get-popular', getFirstFivePorpular)
routes.get('/get-favourite', getFavourite)
routes.post('/add-favourite', postFavourite)
routes.post('/add-order', uploads.single("menu_picture1"), postOrder)
routes.get('/get-order', getOrder)
routes.get('/notify-order', notifyOrder)
routes.post('/delete-favourite', deleteFavourite)
routes.get('/get-tags', getTags)
routes.delete('/menu/:id', deleteMenu);
routes.post('/menu', uploads.single("menu_picture1"), createMenu);
routes.post('/event', uploads.single("menu_picture1"), createEvent);
routes.put('/menu', uploads.single("menu_picture1"), updateMenu);
routes.put('/event', uploads.single("menu_picture1"), updateEvent);
routes.post("/rating", rateProfile)
routes.get("/lanlog", getLanLog)
routes.get("/search", search)
routes.get("/getp", getp)
routes.get("/subscription", getSubscription)
routes.get("/cancelsubscription", cancelSubscription)
routes.get('/activesubscription', createSubscription);
routes.put("/lanlog", updateLanLog)
routes.post("/token", updateToken)

routes.post('/sendTest', sendTestEmailCon)



export default routes;
