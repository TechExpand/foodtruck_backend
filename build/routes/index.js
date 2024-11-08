"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import packages
const express_1 = require("express");
const controllers_1 = require("../controllers");
const upload_1 = require("../helpers/upload");
const favourite_1 = require("../controllers/favourite");
const routes = (0, express_1.Router)();
/*************************************************************************
API CALL START
*************************************************************************/
// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.get('/', controllers_1.apiIndex);
routes.get('/createsubscription', controllers_1.createSubscription);
routes.get('/currentvendorslanlog', controllers_1.onlineLanlogVendors);
routes.get('/currentuserlanlog', controllers_1.onlineLanlogUser);
routes.get('/user', controllers_1.getUser);
routes.delete('/user', controllers_1.deleteUser);
routes.get('/alltags', controllers_1.getAllTags);
routes.get('/profile', controllers_1.getVendorProfile);
routes.get('/profileV2', controllers_1.getVendorProfileV2);
routes.put('/profile', upload_1.uploads.single("pro_pic"), controllers_1.updateProfile);
routes.get('/locationprofile', controllers_1.getProfile);
routes.get('/locationmenu', controllers_1.vendorMenu);
routes.get('/locationevent', controllers_1.vendorEvent);
routes.get('/menu', controllers_1.getMenu);
routes.get('/get-home-details', controllers_1.getHomeDetails);
routes.get('/get-events', controllers_1.getFirstFiveEvents);
routes.get('/get-vendor-event', controllers_1.getVendorEvent);
routes.get('/get-popular', controllers_1.getFirstFivePorpular);
routes.get('/get-favourite', favourite_1.getFavourite);
routes.post('/add-favourite', favourite_1.postFavourite);
routes.post('/add-order', favourite_1.postOrder);
routes.post('/add-order-v2', favourite_1.postOrderV2);
routes.get('/get-order', favourite_1.getOrder);
routes.get('/get-order-v2', favourite_1.getOrderV2);
routes.get('/notify-order', favourite_1.notifyOrder);
routes.get('/notify-orderV2', favourite_1.notifyOrderV2);
routes.post('/delete-favourite', favourite_1.deleteFavourite);
routes.get('/get-tags', controllers_1.getTags);
routes.delete('/menu/:id', controllers_1.deleteMenu);
routes.post('/menu', upload_1.uploads.single("menu_picture1"), controllers_1.createMenu);
routes.post('/event', upload_1.uploads.single("menu_picture1"), controllers_1.createEvent);
routes.put('/menu', upload_1.uploads.single("menu_picture1"), controllers_1.updateMenu);
routes.put('/event', upload_1.uploads.single("menu_picture1"), controllers_1.updateEvent);
routes.post("/rating", controllers_1.rateProfile);
routes.get("/rating", controllers_1.fetchRate);
routes.get("/lanlog", controllers_1.getLanLog);
routes.get("/search", favourite_1.search);
routes.get("/getp", favourite_1.getp);
routes.get("/subscription", controllers_1.getSubscription);
routes.get("/cancelsubscription", controllers_1.cancelSubscription);
routes.get('/activesubscription', controllers_1.createSubscription);
routes.put("/lanlog", controllers_1.updateLanLog);
routes.post("/token", controllers_1.updateToken);
routes.post('/sendTest', controllers_1.sendTestEmailCon);
exports.default = routes;
//# sourceMappingURL=index.js.map