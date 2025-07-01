import { Router } from 'express';
import { ViewsController } from '../controllers/views';

const router = Router();

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

// Add Event page
router.get('/add-event', ViewsController.addEvent);

// Error pages
router.get('/error/404', ViewsController.error404);
router.get('/error/500', ViewsController.error500);

export default router; 