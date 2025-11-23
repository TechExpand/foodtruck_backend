"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const views_1 = require("../controllers/views");
const passwordProtection_1 = require("../middlewares/passwordProtection");
const router = (0, express_1.Router)();
// Admin pages
router.get('/admin-vendors', views_1.ViewsController.adminVendors);
router.get('/admin-tags', views_1.ViewsController.adminTags);
router.get('/admin-events', views_1.ViewsController.adminEvents);
// Dashboard (password protected)
router.get('/', passwordProtection_1.requirePassword, views_1.ViewsController.dashboard);
router.post('/', passwordProtection_1.requirePassword, views_1.ViewsController.dashboard);
// Logout route
router.get('/logout', passwordProtection_1.logout);
// Auth pages
router.get('/auth/login', views_1.ViewsController.login);
router.get('/auth/register', views_1.ViewsController.register);
router.get('/auth/forgot-password', views_1.ViewsController.forgotPassword);
// User pages
router.get('/profile', views_1.ViewsController.profile);
router.get('/users', views_1.ViewsController.users);
// Ecommerce pages
router.get('/ecommerce/products', views_1.ViewsController.products);
router.get('/ecommerce/orders', views_1.ViewsController.orders);
// Component pages
router.get('/components/:component?', views_1.ViewsController.components);
// Form pages
router.get('/forms/:form?', views_1.ViewsController.forms);
// Table pages
router.get('/tables/:table?', views_1.ViewsController.tables);
// Chart pages
router.get('/charts/:chart?', views_1.ViewsController.charts);
// Map pages
router.get('/maps/:map?', views_1.ViewsController.maps);
// Widget pages
router.get('/widgets/:widget?', views_1.ViewsController.widgets);
// Vendors page
router.get('/vendors', views_1.ViewsController.vendors);
// Tags page
router.get('/tags', views_1.ViewsController.adminTags);
// Add Event page
router.get('/add-event', views_1.ViewsController.addEvent);
// Error pages
router.get('/error/404', views_1.ViewsController.error404);
router.get('/error/500', views_1.ViewsController.error500);
// Calendar events API
router.get('/calendar/events', views_1.ViewsController.calendarEvents);
// Calendar page
router.get('/calendar', views_1.ViewsController.calendar);
// Event detail page
router.get('/calendar/event/:id', views_1.ViewsController.eventDetail);
exports.default = router;
//# sourceMappingURL=views.js.map