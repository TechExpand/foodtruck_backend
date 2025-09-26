import { Request, Response, NextFunction } from 'express';
import { Session, SessionData } from 'express-session';

declare module 'express-session' {
    interface SessionData {
        isAuthenticated?: boolean;
    }
}

export const requirePassword = (req: Request, res: Response, next: NextFunction) => {
    // Check if user is already authenticated via session
    if (req.session && req.session.isAuthenticated) {
        return next();
    }

    // Check if this is a password submission
    if (req.method === 'POST' && req.body && req.body.password) {
        const submittedPassword = req.body.password;
        const correctPassword = process.env.FRONTEND_PASSWORD || 'admin123'; // Default fallback

        if (submittedPassword === correctPassword) {
            // Set session authentication
            if (req.session) {
                req.session.isAuthenticated = true;
            }
            return res.redirect(req.originalUrl); // Redirect to same page but now authenticated
        } else {
            // Wrong password
            return res.render('password-protection', {
                title: 'Access Protected - FoodTruck Express',
                error: 'Incorrect password. Please try again.',
                action: req.originalUrl
            });
        }
    }

    // Show password form
    return res.render('password-protection', {
        title: 'Access Protected - FoodTruck Express',
        error: null,
        action: req.originalUrl
    });
};

export const logout = (req: Request, res: Response) => {
    if (req.session) {
        req.session.isAuthenticated = false;
    }
    res.redirect('/');
};