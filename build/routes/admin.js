"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_1 = require("../controllers/admin");
const router = (0, express_1.Router)();
// Vendor Management Routes
router.get('/vendors', admin_1.AdminController.getVendors);
router.get('/vendors/search', admin_1.AdminController.searchVendors);
router.get('/vendors/:id', admin_1.AdminController.getVendorById);
router.put('/vendors/:id', admin_1.AdminController.updateVendor);
router.get('/vendors/:id/edit', admin_1.AdminController.renderEditVendorPage);
// Homepage Tags Management Routes
router.get('/tags', admin_1.AdminController.getHomepageTags);
router.get('/tags/search', admin_1.AdminController.searchTags);
router.post('/tags', admin_1.AdminController.createHomepageTag);
router.put('/tags/:id', admin_1.AdminController.updateHomepageTag);
router.delete('/tags/:id', admin_1.AdminController.deleteHomepageTag);
// Tag Assignment Routes
router.post('/vendors/assign-tag', admin_1.AdminController.assignTagToVendor);
router.delete('/vendors/:vendorId/tag', admin_1.AdminController.removeTagFromVendor);
router.post('/vendors/bulk-assign-tags', admin_1.AdminController.bulkAssignTags);
// Event Management Routes
router.get('/events', admin_1.AdminController.getEvents);
router.get('/events/:id', admin_1.AdminController.getEventById);
router.post('/events/add-vendor', admin_1.AdminController.addVendorToEvent);
router.delete('/events/:eventId/vendors/:profileId', admin_1.AdminController.removeVendorFromEvent);
// Special Tags Routes
router.get('/special-tags', admin_1.AdminController.getAllSpecialTags);
exports.default = router;
//# sourceMappingURL=admin.js.map