"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const Profile_1 = require("../models/Profile");
const Users_1 = require("../models/Users");
const Alltags_1 = require("../models/Alltags");
const Event_1 = require("../models/Event");
const FeaturedEventTrucks_1 = require("../models/FeaturedEventTrucks");
const SpecialTag_1 = require("../models/SpecialTag");
const utility_1 = require("../helpers/utility");
class AdminController {
    // Get all vendors with their profiles
    static getVendors(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vendors = yield Profile_1.Profile.findAll({
                    include: [
                        {
                            model: Users_1.Users,
                            where: { type: 'VENDOR' },
                            attributes: ['id', 'email', 'username']
                        },
                        {
                            model: SpecialTag_1.SpecialTag,
                            include: [
                                {
                                    model: Alltags_1.AllTag,
                                    attributes: ['id', 'title']
                                }
                            ]
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                });
                return (0, utility_1.handleResponse)(res, 200, true, 'Vendors retrieved successfully', vendors);
            }
            catch (error) {
                console.error('Error fetching vendors:', error);
                return (0, utility_1.handleResponse)(res, 500, false, 'Error fetching vendors');
            }
        });
    }
    // Get single vendor by ID
    static getVendorById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const vendor = yield Profile_1.Profile.findByPk(id, {
                    include: [
                        {
                            model: Users_1.Users,
                            attributes: ['id', 'email', 'username']
                        },
                        {
                            model: SpecialTag_1.SpecialTag,
                            include: [
                                {
                                    model: Alltags_1.AllTag,
                                    attributes: ['id', 'title']
                                }
                            ]
                        }
                    ]
                });
                if (!vendor) {
                    return (0, utility_1.handleResponse)(res, 404, false, 'Vendor not found');
                }
                return (0, utility_1.handleResponse)(res, 200, true, 'Vendor retrieved successfully', vendor);
            }
            catch (error) {
                console.error('Error fetching vendor:', error);
                return (0, utility_1.handleResponse)(res, 500, false, 'Error fetching vendor');
            }
        });
    }
    // Update vendor details
    static updateVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const updateData = req.body;
                // Find the vendor
                const vendor = yield Profile_1.Profile.findByPk(id);
                if (!vendor) {
                    return (0, utility_1.handleResponse)(res, 404, false, 'Vendor not found');
                }
                // Debug: Log the raw tags value received
                console.log('RAW TAGS RECEIVED:', updateData.tags);
                // Handle tags (robust: handle array, JSON stringified array, or plain string, and remove surrounding quotes)
                if (updateData.tags) {
                    let tagArr = [];
                    if (Array.isArray(updateData.tags)) {
                        tagArr = updateData.tags.map((t) => t.trim());
                    }
                    else if (typeof updateData.tags === 'string') {
                        let tagsStr = updateData.tags.trim();
                        try {
                            const parsed = JSON.parse(tagsStr);
                            if (Array.isArray(parsed)) {
                                tagArr = parsed.map((t) => t.trim());
                            }
                            else {
                                tagArr = tagsStr.split(',').map((t) => t.trim());
                            }
                        }
                        catch (_a) {
                            if ((tagsStr.startsWith('"') && tagsStr.endsWith('"')) ||
                                (tagsStr.startsWith("'") && tagsStr.endsWith("'"))) {
                                tagsStr = tagsStr.slice(1, -1);
                            }
                            tagArr = tagsStr.split(',').map((t) => t.trim());
                        }
                    }
                    // Remove quotes from each tag individually
                    let tagString = tagArr
                        .map(t => t.replace(/^['"]+|['"]+$/g, '').trim())
                        .filter(Boolean)
                        .join(', ');
                    console.log('PROCESSED TAGS TO SAVE:', tagString);
                    updateData.tag = tagString;
                    delete updateData.tags;
                }
                // Handle specializedTagId (convert to number or null)
                if (updateData.specializedTagId) {
                    updateData.specializedTagId = parseInt(updateData.specializedTagId) || null;
                }
                else {
                    updateData.specializedTagId = null;
                }
                // Update the vendor
                yield vendor.update(updateData);
                return (0, utility_1.handleResponse)(res, 200, true, 'Vendor updated successfully', vendor);
            }
            catch (error) {
                console.error('Error updating vendor:', error);
                return (0, utility_1.handleResponse)(res, 500, false, 'Error updating vendor');
            }
        });
    }
    // Get all homepage tags
    static getHomepageTags(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tags = yield Alltags_1.AllTag.findAll({
                    order: [['createdAt', 'DESC']]
                });
                return (0, utility_1.handleResponse)(res, 200, true, 'Homepage tags retrieved successfully', tags);
            }
            catch (error) {
                console.error('Error fetching homepage tags:', error);
                return (0, utility_1.handleResponse)(res, 500, false, 'Error fetching homepage tags');
            }
        });
    }
    // Create new homepage tag
    static createHomepageTag(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, icon } = req.body;
                if (!title) {
                    return (0, utility_1.handleResponse)(res, 400, false, 'Title is required');
                }
                const tag = yield Alltags_1.AllTag.create({ title, icon });
                return (0, utility_1.handleResponse)(res, 201, true, 'Homepage tag created successfully', tag);
            }
            catch (error) {
                console.error('Error creating homepage tag:', error);
                return (0, utility_1.handleResponse)(res, 500, false, 'Error creating homepage tag');
            }
        });
    }
    // Update homepage tag
    static updateHomepageTag(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { title, icon } = req.body;
                const tag = yield Alltags_1.AllTag.findByPk(id);
                if (!tag) {
                    return (0, utility_1.handleResponse)(res, 404, false, 'Tag not found');
                }
                yield tag.update({ title, icon });
                return (0, utility_1.handleResponse)(res, 200, true, 'Tag updated successfully', tag);
            }
            catch (error) {
                console.error('Error updating tag:', error);
                return (0, utility_1.handleResponse)(res, 500, false, 'Error updating tag');
            }
        });
    }
    // Delete homepage tag
    static deleteHomepageTag(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const tag = yield Alltags_1.AllTag.findByPk(id);
                if (!tag) {
                    return (0, utility_1.handleResponse)(res, 404, false, 'Tag not found');
                }
                yield tag.destroy();
                return (0, utility_1.handleResponse)(res, 200, true, 'Tag deleted successfully');
            }
            catch (error) {
                console.error('Error deleting tag:', error);
                return (0, utility_1.handleResponse)(res, 500, false, 'Error deleting tag');
            }
        });
    }
    // Assign homepage tag to vendor
    static assignTagToVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vendorId, tagId } = req.body;
                if (!vendorId || !tagId) {
                    return (0, utility_1.handleResponse)(res, 400, false, 'Vendor ID and Tag ID are required');
                }
                const vendor = yield Profile_1.Profile.findByPk(vendorId);
                if (!vendor) {
                    return (0, utility_1.handleResponse)(res, 404, false, 'Vendor not found');
                }
                const tag = yield Alltags_1.AllTag.findByPk(tagId);
                if (!tag) {
                    return (0, utility_1.handleResponse)(res, 404, false, 'Tag not found');
                }
                // Update vendor's specialized tag
                yield vendor.update({ specializedTagId: tagId });
                return (0, utility_1.handleResponse)(res, 200, true, 'Tag assigned to vendor successfully');
            }
            catch (error) {
                console.error('Error assigning tag to vendor:', error);
                return (0, utility_1.handleResponse)(res, 500, false, 'Error assigning tag to vendor');
            }
        });
    }
    // Remove homepage tag from vendor
    static removeTagFromVendor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vendorId } = req.params;
                const vendor = yield Profile_1.Profile.findByPk(vendorId);
                if (!vendor) {
                    return (0, utility_1.handleResponse)(res, 404, false, 'Vendor not found');
                }
                yield vendor.update({ specializedTagId: null });
                return (0, utility_1.handleResponse)(res, 200, true, 'Tag removed from vendor successfully');
            }
            catch (error) {
                console.error('Error removing tag from vendor:', error);
                return (0, utility_1.handleResponse)(res, 500, false, 'Error removing tag from vendor');
            }
        });
    }
    // Get all events
    static getEvents(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const events = yield Event_1.Events.findAll({
                    include: [
                        {
                            model: FeaturedEventTrucks_1.FeaturedEventTrucks,
                            include: [
                                {
                                    model: Profile_1.Profile,
                                    include: [
                                        {
                                            model: Users_1.Users,
                                            attributes: ['id', 'email', 'username']
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    order: [['event_date', 'DESC']]
                });
                return (0, utility_1.handleResponse)(res, 200, true, 'Events retrieved successfully', events);
            }
            catch (error) {
                console.error('Error fetching events:', error);
                return (0, utility_1.handleResponse)(res, 500, false, 'Error fetching events');
            }
        });
    }
    // Get single event by ID
    static getEventById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const event = yield Event_1.Events.findByPk(id, {
                    include: [
                        {
                            model: FeaturedEventTrucks_1.FeaturedEventTrucks,
                            include: [
                                {
                                    model: Profile_1.Profile,
                                    include: [
                                        {
                                            model: Users_1.Users,
                                            attributes: ['id', 'email', 'username']
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });
                if (!event) {
                    return (0, utility_1.handleResponse)(res, 404, false, 'Event not found');
                }
                return (0, utility_1.handleResponse)(res, 200, true, 'Event retrieved successfully', event);
            }
            catch (error) {
                console.error('Error fetching event:', error);
                return (0, utility_1.handleResponse)(res, 500, false, 'Error fetching event');
            }
        });
    }
    // Add vendor to event
    static addVendorToEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { eventId, profileId } = req.body;
                if (!eventId || !profileId) {
                    return (0, utility_1.handleResponse)(res, 400, false, 'Event ID and Profile ID are required');
                }
                const event = yield Event_1.Events.findByPk(eventId);
                if (!event) {
                    return (0, utility_1.handleResponse)(res, 404, false, 'Event not found');
                }
                const vendor = yield Profile_1.Profile.findByPk(profileId);
                if (!vendor) {
                    return (0, utility_1.handleResponse)(res, 404, false, 'Vendor not found');
                }
                // Check if vendor is already assigned to this event
                const existingAssignment = yield FeaturedEventTrucks_1.FeaturedEventTrucks.findOne({
                    where: { eventId, profileId }
                });
                if (existingAssignment) {
                    return (0, utility_1.handleResponse)(res, 400, false, 'Vendor is already assigned to this event');
                }
                const assignment = yield FeaturedEventTrucks_1.FeaturedEventTrucks.create({ eventId, profileId });
                return (0, utility_1.handleResponse)(res, 201, true, 'Vendor added to event successfully', assignment);
            }
            catch (error) {
                console.error('Error adding vendor to event:', error);
                return (0, utility_1.handleResponse)(res, 500, false, 'Error adding vendor to event');
            }
        });
    }
    // Remove vendor from event
    static removeVendorFromEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { eventId, profileId } = req.params;
                const assignment = yield FeaturedEventTrucks_1.FeaturedEventTrucks.findOne({
                    where: { eventId, profileId }
                });
                if (!assignment) {
                    return (0, utility_1.handleResponse)(res, 404, false, 'Vendor assignment not found');
                }
                yield assignment.destroy();
                return (0, utility_1.handleResponse)(res, 200, true, 'Vendor removed from event successfully');
            }
            catch (error) {
                console.error('Error removing vendor from event:', error);
                return (0, utility_1.handleResponse)(res, 500, false, 'Error removing vendor from event');
            }
        });
    }
    // Search vendors
    static searchVendors(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { query } = req.query;
                if (!query) {
                    return this.getVendors(req, res);
                }
                const vendors = yield Profile_1.Profile.findAll({
                    include: [
                        {
                            model: Users_1.Users,
                            where: { type: 'VENDOR' },
                            attributes: ['id', 'email', 'username']
                        },
                        {
                            model: SpecialTag_1.SpecialTag,
                            attributes: ['id', 'title']
                        }
                    ],
                    where: {
                        [require('sequelize').Op.or]: [
                            { business_name: { [require('sequelize').Op.like]: `%${query}%` } },
                            { detail: { [require('sequelize').Op.like]: `%${query}%` } },
                            { phone: { [require('sequelize').Op.like]: `%${query}%` } }
                        ]
                    },
                    order: [['createdAt', 'DESC']]
                });
                return (0, utility_1.handleResponse)(res, 200, true, 'Vendors search completed', vendors);
            }
            catch (error) {
                console.error('Error searching vendors:', error);
                return (0, utility_1.handleResponse)(res, 500, false, 'Error searching vendors');
            }
        });
    }
    // Search tags
    static searchTags(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { query } = req.query;
                if (!query) {
                    return this.getHomepageTags(req, res);
                }
                const tags = yield Alltags_1.AllTag.findAll({
                    where: {
                        title: { [require('sequelize').Op.like]: `%${query}%` }
                    },
                    order: [['createdAt', 'DESC']]
                });
                return (0, utility_1.handleResponse)(res, 200, true, 'Tags search completed', tags);
            }
            catch (error) {
                console.error('Error searching tags:', error);
                return (0, utility_1.handleResponse)(res, 500, false, 'Error searching tags');
            }
        });
    }
    // Bulk assign tags to vendors
    static bulkAssignTags(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vendorIds, tagId } = req.body;
                if (!vendorIds || !Array.isArray(vendorIds) || !tagId) {
                    return (0, utility_1.handleResponse)(res, 400, false, 'Vendor IDs array and Tag ID are required');
                }
                const tag = yield Alltags_1.AllTag.findByPk(tagId);
                if (!tag) {
                    return (0, utility_1.handleResponse)(res, 404, false, 'Tag not found');
                }
                const results = [];
                for (const vendorId of vendorIds) {
                    const vendor = yield Profile_1.Profile.findByPk(vendorId);
                    if (vendor) {
                        yield vendor.update({ specializedTagId: tagId });
                        results.push({ vendorId, success: true });
                    }
                    else {
                        results.push({ vendorId, success: false, error: 'Vendor not found' });
                    }
                }
                return (0, utility_1.handleResponse)(res, 200, true, 'Bulk tag assignment completed', results);
            }
            catch (error) {
                console.error('Error bulk assigning tags:', error);
                return (0, utility_1.handleResponse)(res, 500, false, 'Error bulk assigning tags');
            }
        });
    }
    // Get all special tags with their tag names
    static getAllSpecialTags(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const specialTags = yield SpecialTag_1.SpecialTag.findAll({
                    include: [{ model: Alltags_1.AllTag, attributes: ['id', 'title'] }]
                });
                return (0, utility_1.handleResponse)(res, 200, true, 'Special tags retrieved', specialTags);
            }
            catch (error) {
                return (0, utility_1.handleResponse)(res, 500, false, 'Error fetching special tags');
            }
        });
    }
    // Render the vendor edit page
    static renderEditVendorPage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const vendor = yield Profile_1.Profile.findByPk(id, {
                    include: [
                        { model: Users_1.Users, attributes: ['id', 'email', 'username'] },
                        { model: SpecialTag_1.SpecialTag, include: [{ model: Alltags_1.AllTag, attributes: ['id', 'title'] }] }
                    ]
                });
                if (!vendor) {
                    return res.status(404).render('error', { error: 'Vendor not found' });
                }
                const specialTags = yield SpecialTag_1.SpecialTag.findAll({
                    include: [{ model: Alltags_1.AllTag, attributes: ['id', 'title'] }]
                });
                const allTagRecords = yield Alltags_1.AllTag.findAll();
                const tagRecords = yield require('../models/Tag').Tag.findAll();
                const allTagIds = allTagRecords.map(tag => tag.id);
                const regularTags = tagRecords.filter((tag) => !allTagIds.includes(tag.id));
                res.render('admin-vendor-edit', { vendor, specialTags, allTags: regularTags });
            }
            catch (error) {
                console.error('Error rendering vendor edit page:', error);
                res.status(500).render('error', { error: 'Internal server error' });
            }
        });
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.js.map