import { Router } from 'express';
import { AdminController } from '../controllers/admin';

const router = Router();

// Vendor Management Routes
router.get('/vendors', AdminController.getVendors);
router.get('/vendors/search', AdminController.searchVendors);
router.get('/vendors/:id', AdminController.getVendorById);
router.put('/vendors/:id', AdminController.updateVendor);
router.get('/vendors/:id/edit', AdminController.renderEditVendorPage);

// Homepage Tags Management Routes
router.get('/tags', AdminController.getHomepageTags);
router.get('/tags/search', AdminController.searchTags);
router.post('/tags', AdminController.createHomepageTag);
router.put('/tags/:id', AdminController.updateHomepageTag);
router.delete('/tags/:id', AdminController.deleteHomepageTag);

// Tag Assignment Routes
router.post('/vendors/assign-tag', AdminController.assignTagToVendor);
router.delete('/vendors/:vendorId/tag', AdminController.removeTagFromVendor);
router.post('/vendors/bulk-assign-tags', AdminController.bulkAssignTags);

// Event Management Routes
router.get('/events', AdminController.getEvents);
router.get('/events/:id', AdminController.getEventById);
router.post('/events/add-vendor', AdminController.addVendorToEvent);
router.delete('/events/:eventId/vendors/:profileId', AdminController.removeVendorFromEvent);

// Special Tags Routes
router.get('/special-tags', AdminController.getAllSpecialTags);

// Promo Code Management Routes
router.get('/promo-codes', AdminController.getPromoCodes);
router.post('/promo-codes', AdminController.createPromoCode);
router.delete('/promo-codes/:id', AdminController.deletePromoCode);

export default router; 