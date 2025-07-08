"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.ViewsController = void 0;
const Profile_1 = require("../models/Profile");
const Users_1 = require("../models/Users");
const sequelize_1 = require("sequelize");
class ViewsController {
    // Dashboard
    static dashboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch vendor and user counts
                const vendorCount = yield Profile_1.Profile.count({
                    include: [{
                            model: Users_1.Users,
                            as: 'user',
                            where: { type: 'VENDOR' },
                            attributes: []
                        }]
                });
                const userCount = yield Users_1.Users.count({
                    where: {
                        [sequelize_1.Op.or]: [
                            { type: 'USER' },
                            { type: null },
                            { type: '' }
                        ]
                    }
                });
                // Fetch recent vendors (last 5)
                const recentVendors = yield Profile_1.Profile.findAll({
                    limit: 5,
                    order: [['createdAt', 'DESC']],
                    include: [{
                            model: Users_1.Users,
                            as: 'user',
                            where: { type: 'VENDOR' },
                            attributes: ['username', 'email']
                        }]
                });
                // Fetch recent users (last 5)
                const recentUsers = yield Users_1.Users.findAll({
                    where: {
                        [sequelize_1.Op.or]: [
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
                    eventCount = yield Event.count();
                }
                catch (error) {
                    console.log('Event model not available');
                }
                // Get total tags count
                let tagCount = 0;
                try {
                    const { AllTag } = require('../models/Alltags');
                    tagCount = yield AllTag.count();
                }
                catch (error) {
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
                    const popularTag = yield AllTag.findOne({
                        where: {
                            title: { [require('sequelize').Op.like]: '%popular%' }
                        }
                    });
                    if (popularTag) {
                        // Find the special tag record for "popular"
                        const popularSpecialTag = yield SpecialTag.findOne({
                            where: { tagId: popularTag.id }
                        });
                        if (popularSpecialTag) {
                            // Find vendors with this special tag
                            popularVendors = yield Profile.findAll({
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
                }
                catch (error) {
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
            }
            catch (error) {
                console.error('Error rendering dashboard:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    // Auth pages
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.render('auth-basic-login', {
                    title: 'Login - FoodTruck Express'
                });
            }
            catch (error) {
                console.error('Error rendering login:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.render('auth-basic-register', {
                    title: 'Register - FoodTruck Express'
                });
            }
            catch (error) {
                console.error('Error rendering register:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    static forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.render('auth-basic-forgot-password', {
                    title: 'Forgot Password - FoodTruck Express'
                });
            }
            catch (error) {
                console.error('Error rendering forgot password:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    // User pages
    static profile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.render('user-profile', {
                    title: 'Profile - FoodTruck Express',
                    activePage: 'profile',
                    user: req.user || null
                });
            }
            catch (error) {
                console.error('Error rendering profile:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    static users(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { Op } = require('sequelize');
                // Fetch all users with type USER or blank
                const users = yield Users_1.Users.findAll({
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
                const followingCounts = {};
                const userProfiles = {};
                for (const user of users) {
                    // Following count
                    const count = yield Favourite.count({ where: { userId: user.id } });
                    followingCounts[user.id] = count;
                    // Profile
                    const profile = yield Profile.findOne({ where: { userId: user.id } });
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
            }
            catch (error) {
                console.error('Error rendering users:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    // Ecommerce pages
    static products(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.render('ecommerce-products', {
                    title: 'Products - FoodTruck Express',
                    activePage: 'products',
                    user: req.user || null
                });
            }
            catch (error) {
                console.error('Error rendering products:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    static orders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.render('ecommerce-orders', {
                    title: 'Orders - FoodTruck Express',
                    activePage: 'orders',
                    user: req.user || null
                });
            }
            catch (error) {
                console.error('Error rendering orders:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    // Component pages
    static components(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const component = req.params.component || 'buttons';
                res.render(`component-${component}`, {
                    title: `${component.charAt(0).toUpperCase() + component.slice(1)} - FoodTruck Express`,
                    activePage: 'components',
                    user: req.user || null
                });
            }
            catch (error) {
                console.error('Error rendering component:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    // Form pages
    static forms(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const form = req.params.form || 'elements';
                res.render(`form-${form}`, {
                    title: `${form.charAt(0).toUpperCase() + form.slice(1)} - FoodTruck Express`,
                    activePage: 'forms',
                    user: req.user || null
                });
            }
            catch (error) {
                console.error('Error rendering form:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    // Table pages
    static tables(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const table = req.params.table || 'basic-table';
                res.render(`table-${table}`, {
                    title: `${table.charAt(0).toUpperCase() + table.slice(1)} Tables - FoodTruck Express`,
                    activePage: 'tables',
                    user: req.user || null
                });
            }
            catch (error) {
                console.error('Error rendering table:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    // Chart pages
    static charts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chart = req.params.chart || 'apex-chart';
                res.render(`charts-${chart}`, {
                    title: `${chart.charAt(0).toUpperCase() + chart.slice(1)} Charts - FoodTruck Express`,
                    activePage: 'charts',
                    user: req.user || null
                });
            }
            catch (error) {
                console.error('Error rendering chart:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    // Map pages
    static maps(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const map = req.params.map || 'google-maps';
                res.render(`map-${map}`, {
                    title: `${map.charAt(0).toUpperCase() + map.slice(1)} Maps - FoodTruck Express`,
                    activePage: 'maps',
                    user: req.user || null
                });
            }
            catch (error) {
                console.error('Error rendering map:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    // Widget pages
    static widgets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const widget = req.params.widget || 'data';
                res.render(`widgets-${widget}`, {
                    title: `${widget.charAt(0).toUpperCase() + widget.slice(1)} Widgets - FoodTruck Express`,
                    activePage: 'widgets',
                    user: req.user || null
                });
            }
            catch (error) {
                console.error('Error rendering widget:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    // Error pages
    static error404(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.status(404).render('pages-error-404', {
                    title: '404 Not Found - FoodTruck Express'
                });
            }
            catch (error) {
                console.error('Error rendering 404:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    static error500(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.status(500).render('pages-error-505', {
                    title: '500 Server Error - FoodTruck Express'
                });
            }
            catch (error) {
                console.error('Error rendering 500:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    static vendors(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Import models
                const { Profile } = yield Promise.resolve().then(() => __importStar(require('../models/Profile')));
                const { Users } = yield Promise.resolve().then(() => __importStar(require('../models/Users')));
                const { LanLog } = yield Promise.resolve().then(() => __importStar(require('../models/LanLog')));
                const { SpecialTag } = yield Promise.resolve().then(() => __importStar(require('../models/SpecialTag')));
                const { AllTag } = yield Promise.resolve().then(() => __importStar(require('../models/Alltags')));
                const { Tag } = yield Promise.resolve().then(() => __importStar(require('../models/Tag')));
                const { GeocodingService } = yield Promise.resolve().then(() => __importStar(require('../services/geocoding')));
                // TEST: Try geocoding a known coordinate (New York)
                const testCity = yield GeocodingService.getCityFromCoordinates(40.7128, -74.0060);
                console.log('[Geocoding TEST] New York result:', testCity);
                // Fetch vendors with related data
                const vendors = yield Profile.findAll({
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
                const tagRecords = yield Tag.findAll();
                // Create mapping for food category tag title to id
                const foodTagTitleToId = Object.fromEntries(tagRecords.map(tag => { var _a; return [(_a = tag.title) === null || _a === void 0 ? void 0 : _a.toLowerCase(), tag.id]; }));
                // Format vendor data for template
                const formattedVendors = yield Promise.all(vendors.map((vendor) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c;
                    let city = 'Unknown city';
                    if (vendor.lanlogId) {
                        const lanlog = yield LanLog.findByPk(vendor.lanlogId);
                        if (lanlog && lanlog.Lan && lanlog.Log) {
                            city = yield GeocodingService.getCityFromLanLog(lanlog.Lan, lanlog.Log);
                        }
                    }
                    // Food categories from Profile.tag field
                    let foodCategories = [];
                    if (Array.isArray(vendor.tag)) {
                        foodCategories = vendor.tag;
                    }
                    else if (typeof vendor.tag === 'string' && vendor.tag) {
                        try {
                            const parsed = JSON.parse(vendor.tag);
                            if (Array.isArray(parsed))
                                foodCategories = parsed;
                            else
                                foodCategories = vendor.tag.split(',').map(t => t.trim()).filter(Boolean);
                        }
                        catch (e) {
                            foodCategories = vendor.tag.split(',').map(t => t.trim()).filter(Boolean);
                        }
                    }
                    // Process food categories - convert IDs to titles and strip quotes
                    const processedFoodCategories = [];
                    foodCategories.forEach(cat => {
                        if (typeof cat === 'number') {
                            const foundTag = tagRecords.find(t => t.id === cat);
                            if (foundTag) {
                                processedFoodCategories.push(foundTag.title);
                            }
                            else {
                                processedFoodCategories.push(String(cat));
                            }
                        }
                        else {
                            // Strip quotes from string tags
                            const cleanTag = String(cat).replace(/^['"]+|['"]+$/g, '').trim();
                            processedFoodCategories.push(cleanTag);
                        }
                    });
                    foodCategories = processedFoodCategories;
                    // Special tags from Profile.specializedTagId → SpecialTag → AllTag relationship
                    let specialTags = [];
                    if (vendor.specializedTagId && vendor.specialTag && vendor.specialTag.tag) {
                        specialTags = [{
                                id: vendor.specialTag.tag.id,
                                title: vendor.specialTag.tag.title
                            }];
                    }
                    return {
                        id: vendor.id,
                        businessName: vendor.business_name || 'Unnamed Business',
                        email: ((_a = vendor.user) === null || _a === void 0 ? void 0 : _a.email) || 'No email',
                        username: ((_b = vendor.user) === null || _b === void 0 ? void 0 : _b.username) || 'No username',
                        city: city,
                        foodCategories,
                        specialTags,
                        rating: vendor.meanRate || 0,
                        followers: vendor.views || 0,
                        profilePic: vendor.pro_pic || '/images/orders/01.png',
                        dateJoined: vendor.createdAt,
                        online: ((_c = vendor.lanlog) === null || _c === void 0 ? void 0 : _c.online) || false,
                        category: specialTags.length > 0 ? specialTags[0].title : '',
                        subcription_id: vendor.subcription_id || ''
                    };
                })));
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
            }
            catch (error) {
                console.error('Error rendering vendors:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    static addEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.render('add-event', {
                    title: 'Add Event - FoodTruck Express',
                    activePage: 'add-event',
                    user: req.user || null
                });
            }
            catch (error) {
                console.error('Error rendering add-event:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    // Admin pages
    static adminVendors(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.render('admin-vendors', {
                    title: 'Admin - Vendor Management - FoodTruck Express',
                    activePage: 'admin-vendors',
                    user: req.user || null
                });
            }
            catch (error) {
                console.error('Error rendering admin vendors:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    static adminTags(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Import both models
                const { AllTag } = yield Promise.resolve().then(() => __importStar(require('../models/Alltags')));
                const { Tag } = yield Promise.resolve().then(() => __importStar(require('../models/Tag')));
                // Fetch all tags from both tables
                const allTagRecords = yield AllTag.findAll({ order: [['createdAt', 'DESC']] });
                const tagRecords = yield Tag.findAll({ order: [['createdAt', 'DESC']] });
                // Special Tags = All rows from AllTag table
                const specialTags = allTagRecords;
                // All Tags = All rows from Tag table, excluding any that have matching IDs in AllTag table
                const allTagIds = allTagRecords.map(tag => tag.id);
                const regularTags = tagRecords.filter((tag) => !allTagIds.includes(tag.id));
                res.render('admin-tags', {
                    title: 'Admin - Tag Management - FoodTruck Express',
                    activePage: 'admin-tags',
                    user: req.user || null,
                    specialTags: specialTags,
                    allTags: regularTags
                });
            }
            catch (error) {
                console.error('Error rendering admin tags:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    static adminEvents(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.render('admin-events', {
                    title: 'Admin - Event Management - FoodTruck Express',
                    activePage: 'admin-events',
                    user: req.user || null
                });
            }
            catch (error) {
                console.error('Error rendering admin events:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    // Calendar events API
    static calendarEvents(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { Events } = require('../models/Event');
                const events = yield Events.findAll();
                function to24Hour(timeStr) {
                    if (!timeStr)
                        return '00:00:00';
                    const match = timeStr.match(/(\d{1,2})(:(\d{2}))?\s*(am|pm)?/i);
                    if (!match)
                        return timeStr;
                    let hour = parseInt(match[1], 10);
                    let minute = match[3] ? parseInt(match[3], 10) : 0;
                    let ampm = match[4] ? match[4].toLowerCase() : '';
                    if (ampm === 'pm' && hour < 12)
                        hour += 12;
                    if (ampm === 'am' && hour === 12)
                        hour = 0;
                    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
                }
                const formattedEvents = events.map((event) => {
                    let date = event.event_date ? (event.event_date.toISOString ? event.event_date.toISOString().slice(0, 10) : String(event.event_date).slice(0, 10)) : '';
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
            }
            catch (error) {
                console.error('Error fetching calendar events:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
    // Calendar page
    static calendar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.render('app-fullcalender', {
                    title: 'Calendar - FoodTruck Express',
                    activePage: 'calendar',
                    user: req.user || null
                });
            }
            catch (error) {
                console.error('Error rendering calendar:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
    // Event detail page
    static eventDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { Events } = require('../models/Event');
                const event = yield Events.findByPk(req.params.id);
                if (!event) {
                    return res.status(404).render('error', { error: 'Event not found' });
                }
                res.render('event-detail', {
                    title: event.event_title + ' - Event Details',
                    event
                });
            }
            catch (error) {
                console.error('Error rendering event detail:', error);
                res.status(500).render('error', { error: 'Internal Server Error' });
            }
        });
    }
}
exports.ViewsController = ViewsController;
//# sourceMappingURL=views.js.map