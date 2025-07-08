import { Router } from 'express';
import { ViewsController } from '../controllers/views';

const router = Router();

// Admin pages
router.get('/admin-vendors', ViewsController.adminVendors);
router.get('/admin-tags', ViewsController.adminTags);
router.get('/admin-events', ViewsController.adminEvents);

// Dashboard
router.get('/', ViewsController.dashboard);

// Auth pages
router.get('/auth/login', ViewsController.login);
router.get('/auth/register', ViewsController.register);
router.get('/auth/forgot-password', ViewsController.forgotPassword);

// User pages
router.get('/profile', ViewsController.profile);
router.get('/users', ViewsController.users);

// Ecommerce pages
router.get('/ecommerce/products', ViewsController.products);
router.get('/ecommerce/orders', ViewsController.orders);

// Component pages
router.get('/components/:component?', ViewsController.components);

// Form pages
router.get('/forms/:form?', ViewsController.forms);

// Table pages
router.get('/tables/:table?', ViewsController.tables);

// Chart pages
router.get('/charts/:chart?', ViewsController.charts);

// Map pages
router.get('/maps/:map?', ViewsController.maps);

// Widget pages
router.get('/widgets/:widget?', ViewsController.widgets);

// Vendors page
router.get('/vendors', ViewsController.vendors);

// Tags page
router.get('/tags', ViewsController.adminTags);

// Add Event page
router.get('/add-event', ViewsController.addEvent);

// Error pages
router.get('/error/404', ViewsController.error404);
router.get('/error/500', ViewsController.error500);

// Calendar events API
router.get('/calendar/events', ViewsController.calendarEvents);

// Calendar page
router.get('/calendar', ViewsController.calendar);

// Event detail page
router.get('/calendar/event/:id', ViewsController.eventDetail);

export default router; 