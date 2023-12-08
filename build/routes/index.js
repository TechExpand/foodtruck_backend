"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import packages
const express_1 = require("express");
const controllers_1 = require("../controllers");
const upload_1 = require("../helpers/upload");
const auth_1 = require("../controllers/auth");
const routes = (0, express_1.Router)();
/*************************************************************************
API CALL START
*************************************************************************/
// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.get('/', controllers_1.apiIndex);
routes.get('/createsubscription', controllers_1.createSubscription);
routes.get('/currentvendorslanlog', controllers_1.onlineLanlogVendors);
routes.get('/currentuserlanlog', controllers_1.onlineLanlogUser);
routes.get('/profile', controllers_1.getVendorProfile);
routes.get('/email', auth_1.register2);
routes.put('/profile', upload_1.uploads.single("pro_pic"), controllers_1.updateProfile);
routes.get('/locationprofile', controllers_1.getProfile);
routes.get('/locationmenu', controllers_1.vendorMenu);
routes.get('/menu', controllers_1.getMenu);
routes.get('/get-events', controllers_1.getFirstFiveEvents);
routes.get('/get-popular', controllers_1.getFirstFiveEvents);
routes.get('/get-tags', controllers_1.getTags);
routes.delete('/menu/:id', controllers_1.deleteMenu);
routes.post('/menu', upload_1.uploads.single("menu_picture1"), controllers_1.createMenu);
routes.put('/menu/:id', upload_1.uploads.single("menu_picture1"), controllers_1.updateMenu);
routes.post("/rating", controllers_1.rateProfile);
routes.get("/lanlog", controllers_1.getLanLog);
routes.get("/subscription", controllers_1.getSubscription);
routes.get("/cancelsubscription", controllers_1.cancelSubscription);
routes.get('/activesubscription', controllers_1.createSubscription);
routes.put("/lanlog", controllers_1.updateLanLog);
exports.default = routes;
//# sourceMappingURL=index.js.map