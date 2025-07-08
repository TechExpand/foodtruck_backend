import { Request, Response } from 'express';
import { Profile } from '../models/Profile';
import { Users } from '../models/Users';
import { AllTag } from '../models/Alltags';
import { Events } from '../models/Event';
import { FeaturedEventTrucks } from '../models/FeaturedEventTrucks';
import { SpecialTag } from '../models/SpecialTag';
import { handleResponse } from '../helpers/utility';

export class AdminController {
    // Get all vendors with their profiles
    static async getVendors(req: Request, res: Response) {
        try {
            const vendors = await Profile.findAll({
                include: [
                    {
                        model: Users,
                        where: { type: 'VENDOR' },
                        attributes: ['id', 'email', 'username']
                    },
                    {
                        model: SpecialTag,
                        include: [
                            {
                                model: AllTag,
                                attributes: ['id', 'title']
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return handleResponse(res, 200, true, 'Vendors retrieved successfully', vendors);
        } catch (error) {
            console.error('Error fetching vendors:', error);
            return handleResponse(res, 500, false, 'Error fetching vendors');
        }
    }

    // Get single vendor by ID
    static async getVendorById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const vendor = await Profile.findByPk(id, {
                include: [
                    {
                        model: Users,
                        attributes: ['id', 'email', 'username']
                    },
                    {
                        model: SpecialTag,
                        include: [
                            {
                                model: AllTag,
                                attributes: ['id', 'title']
                            }
                        ]
                    }
                ]
            });

            if (!vendor) {
                return handleResponse(res, 404, false, 'Vendor not found');
            }

            return handleResponse(res, 200, true, 'Vendor retrieved successfully', vendor);
        } catch (error) {
            console.error('Error fetching vendor:', error);
            return handleResponse(res, 500, false, 'Error fetching vendor');
        }
    }

    // Update vendor details
    static async updateVendor(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            // Find the vendor
            const vendor = await Profile.findByPk(id);
            if (!vendor) {
                return handleResponse(res, 404, false, 'Vendor not found');
            }
            
            // Debug: Log the raw tags value received
            console.log('RAW TAGS RECEIVED:', updateData.tags);
            // Handle tags (robust: handle array, JSON stringified array, or plain string, and remove surrounding quotes)
            if (updateData.tags) {
                let tagArr: string[] = [];
                if (Array.isArray(updateData.tags)) {
                    tagArr = updateData.tags.map((t: string) => t.trim());
                } else if (typeof updateData.tags === 'string') {
                    let tagsStr = updateData.tags.trim();
                    try {
                        const parsed = JSON.parse(tagsStr);
                        if (Array.isArray(parsed)) {
                            tagArr = parsed.map((t: string) => t.trim());
                        } else {
                            tagArr = tagsStr.split(',').map((t: string) => t.trim());
                        }
                    } catch {
                        if ((tagsStr.startsWith('"') && tagsStr.endsWith('"')) ||
                            (tagsStr.startsWith("'") && tagsStr.endsWith("'"))) {
                            tagsStr = tagsStr.slice(1, -1);
                        }
                        tagArr = tagsStr.split(',').map((t: string) => t.trim());
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
            } else {
                updateData.specializedTagId = null;
            }
            
            // Update the vendor
            await vendor.update(updateData);
            
            return handleResponse(res, 200, true, 'Vendor updated successfully', vendor);
        } catch (error) {
            console.error('Error updating vendor:', error);
            return handleResponse(res, 500, false, 'Error updating vendor');
        }
    }

    // Get all homepage tags
    static async getHomepageTags(req: Request, res: Response) {
        try {
            const tags = await AllTag.findAll({
                order: [['createdAt', 'DESC']]
            });

            return handleResponse(res, 200, true, 'Homepage tags retrieved successfully', tags);
        } catch (error) {
            console.error('Error fetching homepage tags:', error);
            return handleResponse(res, 500, false, 'Error fetching homepage tags');
        }
    }

    // Create new homepage tag
    static async createHomepageTag(req: Request, res: Response) {
        try {
            const { title, icon } = req.body;

            if (!title) {
                return handleResponse(res, 400, false, 'Title is required');
            }

            const tag = await AllTag.create({ title, icon });
            return handleResponse(res, 201, true, 'Homepage tag created successfully', tag);
        } catch (error) {
            console.error('Error creating homepage tag:', error);
            return handleResponse(res, 500, false, 'Error creating homepage tag');
        }
    }

    // Update homepage tag
    static async updateHomepageTag(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { title, icon } = req.body;

            const tag = await AllTag.findByPk(id);
            if (!tag) {
                return handleResponse(res, 404, false, 'Tag not found');
            }

            await tag.update({ title, icon });
            return handleResponse(res, 200, true, 'Tag updated successfully', tag);
        } catch (error) {
            console.error('Error updating tag:', error);
            return handleResponse(res, 500, false, 'Error updating tag');
        }
    }

    // Delete homepage tag
    static async deleteHomepageTag(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const tag = await AllTag.findByPk(id);
            if (!tag) {
                return handleResponse(res, 404, false, 'Tag not found');
            }

            await tag.destroy();
            return handleResponse(res, 200, true, 'Tag deleted successfully');
        } catch (error) {
            console.error('Error deleting tag:', error);
            return handleResponse(res, 500, false, 'Error deleting tag');
        }
    }

    // Assign homepage tag to vendor
    static async assignTagToVendor(req: Request, res: Response) {
        try {
            const { vendorId, tagId } = req.body;

            if (!vendorId || !tagId) {
                return handleResponse(res, 400, false, 'Vendor ID and Tag ID are required');
            }

            const vendor = await Profile.findByPk(vendorId);
            if (!vendor) {
                return handleResponse(res, 404, false, 'Vendor not found');
            }

            const tag = await AllTag.findByPk(tagId);
            if (!tag) {
                return handleResponse(res, 404, false, 'Tag not found');
            }

            // Update vendor's specialized tag
            await vendor.update({ specializedTagId: tagId });
            return handleResponse(res, 200, true, 'Tag assigned to vendor successfully');
        } catch (error) {
            console.error('Error assigning tag to vendor:', error);
            return handleResponse(res, 500, false, 'Error assigning tag to vendor');
        }
    }

    // Remove homepage tag from vendor
    static async removeTagFromVendor(req: Request, res: Response) {
        try {
            const { vendorId } = req.params;

            const vendor = await Profile.findByPk(vendorId);
            if (!vendor) {
                return handleResponse(res, 404, false, 'Vendor not found');
            }

            await vendor.update({ specializedTagId: null });
            return handleResponse(res, 200, true, 'Tag removed from vendor successfully');
        } catch (error) {
            console.error('Error removing tag from vendor:', error);
            return handleResponse(res, 500, false, 'Error removing tag from vendor');
        }
    }

    // Get all events
    static async getEvents(req: Request, res: Response) {
        try {
            const events = await Events.findAll({
                include: [
                    {
                        model: FeaturedEventTrucks,
                        include: [
                            {
                                model: Profile,
                                include: [
                                    {
                                        model: Users,
                                        attributes: ['id', 'email', 'username']
                                    }
                                ]
                            }
                        ]
                    }
                ],
                order: [['event_date', 'DESC']]
            });

            return handleResponse(res, 200, true, 'Events retrieved successfully', events);
        } catch (error) {
            console.error('Error fetching events:', error);
            return handleResponse(res, 500, false, 'Error fetching events');
        }
    }

    // Get single event by ID
    static async getEventById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const event = await Events.findByPk(id, {
                include: [
                    {
                        model: FeaturedEventTrucks,
                        include: [
                            {
                                model: Profile,
                                include: [
                                    {
                                        model: Users,
                                        attributes: ['id', 'email', 'username']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (!event) {
                return handleResponse(res, 404, false, 'Event not found');
            }

            return handleResponse(res, 200, true, 'Event retrieved successfully', event);
        } catch (error) {
            console.error('Error fetching event:', error);
            return handleResponse(res, 500, false, 'Error fetching event');
        }
    }

    // Add vendor to event
    static async addVendorToEvent(req: Request, res: Response) {
        try {
            const { eventId, profileId } = req.body;

            if (!eventId || !profileId) {
                return handleResponse(res, 400, false, 'Event ID and Profile ID are required');
            }

            const event = await Events.findByPk(eventId);
            if (!event) {
                return handleResponse(res, 404, false, 'Event not found');
            }

            const vendor = await Profile.findByPk(profileId);
            if (!vendor) {
                return handleResponse(res, 404, false, 'Vendor not found');
            }

            // Check if vendor is already assigned to this event
            const existingAssignment = await FeaturedEventTrucks.findOne({
                where: { eventId, profileId }
            });

            if (existingAssignment) {
                return handleResponse(res, 400, false, 'Vendor is already assigned to this event');
            }

            const assignment = await FeaturedEventTrucks.create({ eventId, profileId });
            return handleResponse(res, 201, true, 'Vendor added to event successfully', assignment);
        } catch (error) {
            console.error('Error adding vendor to event:', error);
            return handleResponse(res, 500, false, 'Error adding vendor to event');
        }
    }

    // Remove vendor from event
    static async removeVendorFromEvent(req: Request, res: Response) {
        try {
            const { eventId, profileId } = req.params;

            const assignment = await FeaturedEventTrucks.findOne({
                where: { eventId, profileId }
            });

            if (!assignment) {
                return handleResponse(res, 404, false, 'Vendor assignment not found');
            }

            await assignment.destroy();
            return handleResponse(res, 200, true, 'Vendor removed from event successfully');
        } catch (error) {
            console.error('Error removing vendor from event:', error);
            return handleResponse(res, 500, false, 'Error removing vendor from event');
        }
    }

    // Search vendors
    static async searchVendors(req: Request, res: Response) {
        try {
            const { query } = req.query;
            
            if (!query) {
                return this.getVendors(req, res);
            }

            const vendors = await Profile.findAll({
                include: [
                    {
                        model: Users,
                        where: { type: 'VENDOR' },
                        attributes: ['id', 'email', 'username']
                    },
                    {
                        model: SpecialTag,
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

            return handleResponse(res, 200, true, 'Vendors search completed', vendors);
        } catch (error) {
            console.error('Error searching vendors:', error);
            return handleResponse(res, 500, false, 'Error searching vendors');
        }
    }

    // Search tags
    static async searchTags(req: Request, res: Response) {
        try {
            const { query } = req.query;
            
            if (!query) {
                return this.getHomepageTags(req, res);
            }

            const tags = await AllTag.findAll({
                where: {
                    title: { [require('sequelize').Op.like]: `%${query}%` }
                },
                order: [['createdAt', 'DESC']]
            });

            return handleResponse(res, 200, true, 'Tags search completed', tags);
        } catch (error) {
            console.error('Error searching tags:', error);
            return handleResponse(res, 500, false, 'Error searching tags');
        }
    }

    // Bulk assign tags to vendors
    static async bulkAssignTags(req: Request, res: Response) {
        try {
            const { vendorIds, tagId } = req.body;

            if (!vendorIds || !Array.isArray(vendorIds) || !tagId) {
                return handleResponse(res, 400, false, 'Vendor IDs array and Tag ID are required');
            }

            const tag = await AllTag.findByPk(tagId);
            if (!tag) {
                return handleResponse(res, 404, false, 'Tag not found');
            }

            const results = [];
            for (const vendorId of vendorIds) {
                const vendor = await Profile.findByPk(vendorId);
                if (vendor) {
                    await vendor.update({ specializedTagId: tagId });
                    results.push({ vendorId, success: true });
                } else {
                    results.push({ vendorId, success: false, error: 'Vendor not found' });
                }
            }

            return handleResponse(res, 200, true, 'Bulk tag assignment completed', results);
        } catch (error) {
            console.error('Error bulk assigning tags:', error);
            return handleResponse(res, 500, false, 'Error bulk assigning tags');
        }
    }

    // Get all special tags with their tag names
    static async getAllSpecialTags(req: Request, res: Response) {
        try {
            const specialTags = await SpecialTag.findAll({
                include: [{ model: AllTag, attributes: ['id', 'title'] }]
            });
            return handleResponse(res, 200, true, 'Special tags retrieved', specialTags);
        } catch (error) {
            return handleResponse(res, 500, false, 'Error fetching special tags');
        }
    }

    // Render the vendor edit page
    static async renderEditVendorPage(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const vendor = await Profile.findByPk(id, {
                include: [
                    { model: Users, attributes: ['id', 'email', 'username'] },
                    { model: SpecialTag, include: [{ model: AllTag, attributes: ['id', 'title'] }] }
                ]
            });
            if (!vendor) {
                return res.status(404).render('error', { error: 'Vendor not found' });
            }
            const specialTags = await SpecialTag.findAll({
                include: [{ model: AllTag, attributes: ['id', 'title'] }]
            });
            const allTagRecords = await AllTag.findAll();
            const tagRecords = await require('../models/Tag').Tag.findAll();
            const allTagIds = allTagRecords.map(tag => tag.id);
            const regularTags = tagRecords.filter((tag: any) => !allTagIds.includes(tag.id));
            res.render('admin-vendor-edit', { vendor, specialTags, allTags: regularTags });
        } catch (error) {
            console.error('Error rendering vendor edit page:', error);
            res.status(500).render('error', { error: 'Internal server error' });
        }
    }
} 