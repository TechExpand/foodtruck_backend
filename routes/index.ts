// Import packages
import { Router } from 'express';
import { apiIndex, cancelSubscription, createEvent, createMenu, createSubscription, deleteMenu, deleteUser, fetchRate, getAllTags, getFirstFiveEvents, getFirstFivePorpular, getHomeDetails, getLanLog, getMenu, getProfile, getSubscription, getTags, getUser, getVendorEvent, getVendorProfile, getVendorProfileV2, onlineLanlogUser, onlineLanlogVendors, rateProfile, sendTestEmailCon, updateEvent, updateLanLog, updateMenu, updateProfile, updateToken, vendorEvent, vendorMenu } from '../controllers';
import { uploads } from '../helpers/upload';
import { deleteFavourite, getFavourite, getOrder, getOrderV2, getp, notifyOrder, notifyOrderV2, postFavourite, postOrder, postOrderV2, search } from '../controllers/favourite';


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
routes.delete('/user', deleteUser);
routes.get('/alltags', getAllTags);
routes.get('/profile', getVendorProfile);
routes.get('/profileV2', getVendorProfileV2);
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
routes.post('/add-order', postOrder)
routes.post('/add-order-v2', postOrderV2)
routes.get('/get-order', getOrder)
routes.get('/get-order-v2', getOrderV2)
routes.get('/notify-order', notifyOrder)
routes.get('/notify-orderV2', notifyOrderV2)
routes.post('/delete-favourite', deleteFavourite)
routes.get('/get-tags', getTags)
routes.delete('/menu/:id', deleteMenu);
routes.post('/menu', uploads.single("menu_picture1"), createMenu);
routes.post('/event', uploads.single("menu_picture1"), createEvent);
routes.put('/menu', uploads.single("menu_picture1"), updateMenu);
routes.put('/event', uploads.single("menu_picture1"), updateEvent);
routes.post("/rating", rateProfile)
routes.get("/rating", fetchRate)
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
