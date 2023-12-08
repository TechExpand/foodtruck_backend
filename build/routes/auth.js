"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import packages
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_1 = require("../controllers/auth");
const upload_1 = require("../helpers/upload");
const routes = (0, express_1.Router)();
/*************************************************************************
API CALL START
*************************************************************************/
// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.post('/send-otp', auth_1.sendOtp);
routes.post('/change-password', auth_1.changePassword);
routes.post('/verify-otp', auth_1.verifyOtp);
routes.post('/token/login/', auth_1.login);
routes.post('/users/', auth_1.register);
routes.post('/lanlog/', controllers_1.createLocation);
routes.post('/createprofile/', upload_1.uploads.single("pro_pic"), controllers_1.createProfile);
exports.default = routes;
//# sourceMappingURL=auth.js.map