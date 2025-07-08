import { Request, Response } from 'express';
import { Profile } from '../models/Profile';
import { Users } from '../models/Users';
import { Op } from 'sequelize';
import { SpecialTag } from '../models/SpecialTag';

export class ViewsController {
    // Dashboard
    static async dashboard(req: Request, res: Response) {
        try {
            // Fetch vendor and user counts
            const vendorCount = await Profile.count({
                include: [{
                    model: Users,
                    as: 'user',
                    where: { type: 'VENDOR' },
                    attributes: []
                }]
            });
            const userCount = await Users.count({
                where: {
                    [Op.or]: [
                        { type: 'USER' },
                        { type: null },
                        { type: '' }
                    ]
                }
            });
            
            // Fetch recent vendors (last 5)
            const recentVendors = await Profile.findAll({
                limit: 5,
                order: [['createdAt', 'DESC']],
                include: [{
                    model: Users,
                    as: 'user',
                    where: { type: 'VENDOR' },
                    attributes: ['username', 'email']
                }]
            });

            // Fetch recent users (last 5)
            const recentUsers = await Users.findAll({
                where: {
                    [Op.or]: [
                        { type: 'USER' },
                        { type: null },
                        { type: '' }
                    ]
                },
                limit: 5,
                order: [['createdAt', 'DESC']]
            });

            // Calculate growth percentages (mock data for now)
            const userGrowth = 12.5; // Mock percentage
            const vendorGrowth = 8.6; // Mock percentage
            
            // Get total events count if Event model exists
            let eventCount = 0;
            try {
                const { Event } = require('../models/Event');
                eventCount = await Event.count();
            } catch (error) {
                console.log('Event model not available');
            }

            // Get total tags count
            let tagCount = 0;
            try {
                const { AllTag } = require('../models/Alltags');
                tagCount = await AllTag.count();
            } catch (error) {
                console.log('AllTag model not available');
            }

            // Fetch popular vendors (vendors with "popular" special tag)
            let popularVendors = [];
            try {
                const { AllTag } = require('../models/Alltags');
                const { SpecialTag } = require('../models/SpecialTag');
                const { Profile } = require('../models/Profile');
                const { Users } = require('../models/Users');
                
                // First, find the "popular" tag in AllTag table (case-insensitive)
                const popularTag = await AllTag.findOne({
                    where: { 
                        title: { [require('sequelize').Op.like]: '%popular%' }
                    }
                });
                
                if (popularTag) {
                    // Find the special tag record for "popular"
                    const popularSpecialTag = await SpecialTag.findOne({
                        where: { tagId: popularTag.id }
                    });
                    
                    if (popularSpecialTag) {
                        // Find vendors with this special tag
                        popularVendors = await Profile.findAll({
                            where: { specializedTagId: popularSpecialTag.id },
                            limit: 5,
                            order: [['createdAt', 'DESC']],
                            include: [{
                                model: Users,
                                as: 'user',
                                where: { type: 'VENDOR' },
                                attributes: ['username', 'email']
                            }]
                        });
                    }
                }
            } catch (error) {
                console.log('Error fetching popular vendors:', error);
            }

            res.render('index', {
                title: 'Dashboard - FoodTruck Express',
                activePage: 'dashboard',
                user: req.user || null,
                vendorCount,
                userCount,
                eventCount,
                tagCount,
                recentVendors,
                recentUsers,
                userGrowth,
                vendorGrowth,
                popularVendors
            });
        } catch (error) {
            console.error('Error rendering dashboard:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    // Auth pages
    static async login(req: Request, res: Response) {
        try {
            res.render('auth-basic-login', {
                title: 'Login - FoodTruck Express'
            });
        } catch (error) {
            console.error('Error rendering login:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    static async register(req: Request, res: Response) {
        try {
            res.render('auth-basic-register', {
                title: 'Register - FoodTruck Express'
            });
        } catch (error) {
            console.error('Error rendering register:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    static async forgotPassword(req: Request, res: Response) {
        try {
            res.render('auth-basic-forgot-password', {
                title: 'Forgot Password - FoodTruck Express'
            });
        } catch (error) {
            console.error('Error rendering forgot password:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    // User pages
    static async profile(req: Request, res: Response) {
        try {
            res.render('user-profile', {
                title: 'Profile - FoodTruck Express',
                activePage: 'profile',
                user: req.user || null
            });
        } catch (error) {
            console.error('Error rendering profile:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    static async users(req: Request, res: Response) {
        try {
            const { Op } = require('sequelize');
            // Fetch all users with type USER or blank
            const users = await Users.findAll({
                attributes: ['id', 'email', 'username', 'createdAt', 'type'],
                where: {
                    [Op.or]: [
                        { type: 'USER' },
                        { type: null },
                        { type: '' }
                    ]
                },
                order: [['createdAt', 'DESC']]
            });

            // Fetch following counts for each user
            const Favourite = require('../models/Favourite').Favourite;
            const { Profile } = require('../models/Profile');
            const followingCounts: Record<number, number> = {};
            const userProfiles: Record<number, any> = {};

            for (const user of users) {
                // Following count
                const count = await Favourite.count({ where: { userId: user.id } });
                followingCounts[user.id] = count;

                // Profile
                const profile = await Profile.findOne({ where: { userId: user.id } });
                userProfiles[user.id] = profile;
            }

            res.render('users', {
                title: 'Users - FoodTruck Express',
                activePage: 'users',
                user: req.user || null,
                users,
                followingCounts,
                userProfiles
            });
        } catch (error) {
            console.error('Error rendering users:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    // Ecommerce pages
    static async products(req: Request, res: Response) {
        try {
            res.render('ecommerce-products', {
                title: 'Products - FoodTruck Express',
                activePage: 'products',
                user: req.user || null
            });
        } catch (error) {
            console.error('Error rendering products:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    static async orders(req: Request, res: Response) {
        try {
            res.render('ecommerce-orders', {
                title: 'Orders - FoodTruck Express',
                activePage: 'orders',
                user: req.user || null
            });
        } catch (error) {
            console.error('Error rendering orders:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    // Component pages
    static async components(req: Request, res: Response) {
        try {
            const component = req.params.component || 'buttons';
            res.render(`component-${component}`, {
                title: `${component.charAt(0).toUpperCase() + component.slice(1)} - FoodTruck Express`,
                activePage: 'components',
                user: req.user || null
            });
        } catch (error) {
            console.error('Error rendering component:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    // Form pages
    static async forms(req: Request, res: Response) {
        try {
            const form = req.params.form || 'elements';
            res.render(`form-${form}`, {
                title: `${form.charAt(0).toUpperCase() + form.slice(1)} - FoodTruck Express`,
                activePage: 'forms',
                user: req.user || null
            });
        } catch (error) {
            console.error('Error rendering form:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    // Table pages
    static async tables(req: Request, res: Response) {
        try {
            const table = req.params.table || 'basic-table';
            res.render(`table-${table}`, {
                title: `${table.charAt(0).toUpperCase() + table.slice(1)} Tables - FoodTruck Express`,
                activePage: 'tables',
                user: req.user || null
            });
        } catch (error) {
            console.error('Error rendering table:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    // Chart pages
    static async charts(req: Request, res: Response) {
        try {
            const chart = req.params.chart || 'apex-chart';
            res.render(`charts-${chart}`, {
                title: `${chart.charAt(0).toUpperCase() + chart.slice(1)} Charts - FoodTruck Express`,
                activePage: 'charts',
                user: req.user || null
            });
        } catch (error) {
            console.error('Error rendering chart:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    // Map pages
    static async maps(req: Request, res: Response) {
        try {
            const map = req.params.map || 'google-maps';
            res.render(`map-${map}`, {
                title: `${map.charAt(0).toUpperCase() + map.slice(1)} Maps - FoodTruck Express`,
                activePage: 'maps',
                user: req.user || null
            });
        } catch (error) {
            console.error('Error rendering map:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    // Widget pages
    static async widgets(req: Request, res: Response) {
        try {
            const widget = req.params.widget || 'data';
            res.render(`widgets-${widget}`, {
                title: `${widget.charAt(0).toUpperCase() + widget.slice(1)} Widgets - FoodTruck Express`,
                activePage: 'widgets',
                user: req.user || null
            });
        } catch (error) {
            console.error('Error rendering widget:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    // Error pages
    static async error404(req: Request, res: Response) {
        try {
            res.status(404).render('pages-error-404', {
                title: '404 Not Found - FoodTruck Express'
            });
        } catch (error) {
            console.error('Error rendering 404:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    static async error500(req: Request, res: Response) {
        try {
            res.status(500).render('pages-error-505', {
                title: '500 Server Error - FoodTruck Express'
            });
        } catch (error) {
            console.error('Error rendering 500:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    static async vendors(req: Request, res: Response) {
        try {
            // Import models
            const { Profile } = await import('../models/Profile');
            const { Users } = await import('../models/Users');
            const { LanLog } = await import('../models/LanLog');
            const { SpecialTag } = await import('../models/SpecialTag');
            const { AllTag } = await import('../models/Alltags');
            const { Tag } = await import('../models/Tag');
            const { GeocodingService } = await import('../services/geocoding');

            // TEST: Try geocoding a known coordinate (New York)
            const testCity = await GeocodingService.getCityFromCoordinates(40.7128, -74.0060);
            console.log('[Geocoding TEST] New York result:', testCity);

            // Fetch vendors with related data
            const vendors = await Profile.findAll({
                include: [
                    {
                        model: Users,
                        as: 'user',
                        attributes: ['email', 'username', 'type']
                    },
                    {
                        model: LanLog,
                        as: 'lanlog',
                        attributes: ['Lan', 'Log', 'online']
                    },
                    {
                        model: SpecialTag,
                        as: 'specialTag',
                        include: [
                            {
                                model: AllTag,
                                as: 'tag',
                                attributes: ['title']
                            }
                        ]
                    }
                ],
                where: {
                    '$user.type$': 'VENDOR'
                },
                order: [['createdAt', 'DESC']]
            });

            // Fetch all tags from Tag table for food categories
            const tagRecords = await AllTag.findAll();
            
            // Create mapping for food category tag title to id
            const foodTagTitleToId = Object.fromEntries(tagRecords.map(tag => [tag.title?.toLowerCase(), tag.id]));

            // Format vendor data for template
            const formattedVendors = await Promise.all(vendors.map(async vendor => {
                let city = 'Unknown city';
                if (vendor.lanlogId) {
                    const lanlog = await LanLog.findByPk(vendor.lanlogId);
                    if (lanlog && lanlog.Lan && lanlog.Log) {
                        city = await GeocodingService.getCityFromLanLog(lanlog.Lan, lanlog.Log);
                    }
                }

                // Food categories from Profile.tag field
                let foodCategories: (string|number)[] = [];
                if (Array.isArray(vendor.tag)) {
                  foodCategories = vendor.tag;
                } else if (typeof vendor.tag === 'string' && vendor.tag) {
                  try {
                    const parsed = JSON.parse(vendor.tag);
                    if (Array.isArray(parsed)) foodCategories = parsed;
                    else foodCategories = vendor.tag.split(',').map(t => t.trim()).filter(Boolean);
                  } catch (e) {
                    foodCategories = vendor.tag.split(',').map(t => t.trim()).filter(Boolean);
                  }
                }
                
                // Process food categories - convert IDs to titles and strip quotes
                const processedFoodCategories: string[] = [];
                foodCategories.forEach(cat => {
                  if (typeof cat === 'number') {
                    const foundTag = tagRecords.find(t => t.id === cat);
                    if (foundTag) {
                      processedFoodCategories.push(foundTag.title);
                    } else {
                      processedFoodCategories.push(String(cat));
                    }
                  } else {
                    // Strip quotes from string tags
                    const cleanTag = String(cat).replace(/^['"]+|['"]+$/g, '').trim();
                    processedFoodCategories.push(cleanTag);
                  }
                });
                foodCategories = processedFoodCategories;
                
                // Special tags from Profile.specializedTagId → SpecialTag → AllTag relationship
                let specialTags: { id: number, title: string }[] = [];
                if (vendor.specializedTagId && vendor.specialTag && vendor.specialTag.tag) {
                  specialTags = [{
                    id: vendor.specialTag.tag.id,
                    title: vendor.specialTag.tag.title
                  }];
                }

                return {
                    id: vendor.id,
                    businessName: vendor.business_name || 'Unnamed Business',
                    email: vendor.user?.email || 'No email',
                    username: vendor.user?.username || 'No username',
                    city: city,
                    foodCategories,
                    specialTags, // now an array of {id, title}
                    rating: vendor.meanRate || 0,
                    followers: vendor.views || 0,
                    profilePic: vendor.pro_pic || '/images/orders/01.png',
                    dateJoined: vendor.createdAt,
                    online: vendor.lanlog?.online || false,
                    category: specialTags.length > 0 ? specialTags[0].title : '',
                    subcription_id: vendor.subcription_id || ''
                };
            }));

            // Calculate counts
            const allCount = formattedVendors.length;
            const onlineCount = formattedVendors.filter(v => {
              const val = String(v.online).toLowerCase();
              return val === 'true' || val === '1';
            }).length;
            const subscribedCount = formattedVendors.filter(v => v.subcription_id && v.subcription_id !== '').length;

            res.render('vendors', {
                title: 'Vendors - FoodTruck Express',
                activePage: 'vendors',
                user: req.user || null,
                vendors: formattedVendors,
                allCount,
                onlineCount,
                subscribedCount
            });
        } catch (error) {
            console.error('Error rendering vendors:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    static async addEvent(req: Request, res: Response) {
        try {
            res.render('add-event', {
                title: 'Add Event - FoodTruck Express',
                activePage: 'add-event',
                user: req.user || null
            });
        } catch (error) {
            console.error('Error rendering add-event:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    // Admin pages
    static async adminVendors(req: Request, res: Response) {
        try {
            res.render('admin-vendors', {
                title: 'Admin - Vendor Management - FoodTruck Express',
                activePage: 'admin-vendors',
                user: req.user || null
            });
        } catch (error) {
            console.error('Error rendering admin vendors:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    static async adminTags(req: Request, res: Response) {
        try {
            // Import both models
            const { AllTag } = await import('../models/Alltags');
            const { Tag } = await import('../models/Tag');
            
            // Fetch all tags from both tables
            const allTagRecords = await AllTag.findAll({ order: [['createdAt', 'DESC']] });
            // const tagRecords = await Tag.findAll({ order: [['createdAt', 'DESC']] });
            
            // Special Tags = All rows from AllTag table
            const allSpecialTags = await SpecialTag.findAll({ order: [['createdAt', 'DESC']] });
            
            // All Tags = All rows from Tag table, excluding any that have matching IDs in AllTag table
            const specialTagIds = allSpecialTags.map(tag => tag.tagId);
            const regularTags = allTagRecords.filter((tag: any) => !specialTagIds.includes(tag.id));
             const specialTags = allTagRecords.filter((tag: any) => !specialTagIds.includes(tag.id));
            
            res.render('admin-tags', {
                title: 'Admin - Tag Management - FoodTruck Express',
                activePage: 'admin-tags',
                user: req.user || null,
                specialTags: specialTags,
                allTags: regularTags
            });
        } catch (error) {
            console.error('Error rendering admin tags:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    static async adminEvents(req: Request, res: Response) {
        try {
            res.render('admin-events', {
                title: 'Admin - Event Management - FoodTruck Express',
                activePage: 'admin-events',
                user: req.user || null
            });
        } catch (error) {
            console.error('Error rendering admin events:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    // Calendar events API
    static async calendarEvents(req: Request, res: Response) {
        try {
            const { Events } = require('../models/Event');
            const events = await Events.findAll();
            function to24Hour(timeStr: string) {
                if (!timeStr) return '00:00:00';
                const match = timeStr.match(/(\d{1,2})(:(\d{2}))?\s*(am|pm)?/i);
                if (!match) return timeStr;
                let hour = parseInt(match[1], 10);
                let minute = match[3] ? parseInt(match[3], 10) : 0;
                let ampm = match[4] ? match[4].toLowerCase() : '';
                if (ampm === 'pm' && hour < 12) hour += 12;
                if (ampm === 'am' && hour === 12) hour = 0;
                return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
            }
            const formattedEvents = events.map((event: any) => {
                let date = event.event_date ? (event.event_date.toISOString ? event.event_date.toISOString().slice(0,10) : String(event.event_date).slice(0,10)) : '';
                let start = date && event.event_start_time ? `${date}T${to24Hour(event.event_start_time)}` : undefined;
                let end = date && event.event_close_time ? `${date}T${to24Hour(event.event_close_time)}` : undefined;
                return {
                    id: event.id,
                    title: event.event_title,
                    start,
                    end,
                    description: event.event_description,
                    image: event.menu_picture
                };
            });
            res.json(formattedEvents);
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Calendar page
    static async calendar(req: Request, res: Response) {
        try {
            res.render('app-fullcalender', {
                title: 'Calendar - FoodTruck Express',
                activePage: 'calendar',
                user: req.user || null
            });
        } catch (error) {
            console.error('Error rendering calendar:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }

    // Event detail page
    static async eventDetail(req: Request, res: Response) {
        try {
            const { Events } = require('../models/Event');
            const event = await Events.findByPk(req.params.id);
            if (!event) {
                return res.status(404).render('error', { error: 'Event not found' });
            }
            res.render('event-detail', {
                title: event.event_title + ' - Event Details',
                event
            });
        } catch (error) {
            console.error('Error rendering event detail:', error);
            res.status(500).render('error', { error: 'Internal Server Error' });
        }
    }
} 