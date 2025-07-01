import { Request, Response } from 'express';

export class ViewsController {
    // Dashboard
    static async dashboard(req: Request, res: Response) {
        try {
            res.render('index', {
                title: 'Dashboard - FoodTruck Express',
                activePage: 'dashboard',
                user: req.user || null
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
            res.render('users', {
                title: 'Users - FoodTruck Express',
                activePage: 'users',
                user: req.user || null
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
            res.render('vendors', {
                title: 'Vendors - FoodTruck Express',
                activePage: 'vendors',
                user: req.user || null
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
} 