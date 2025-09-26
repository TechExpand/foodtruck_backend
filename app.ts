import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import config from './config/configSetup';

import { initDB } from './controllers/db';
import index from './routes/index';
import auth from './routes/auth';
import views from './routes/views';
import admin from './routes/admin';
import { isAuthorized } from './middlewares/authorise';

const app: Application = express();

app.use(morgan('dev'));

// PARSE JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SESSION CONFIGURATION
app.use(session({
	secret: process.env.SESSION_SECRET || 'foodtruck-session-secret-key',
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: process.env.NODE_ENV === 'production',
		maxAge: 24 * 60 * 60 * 1000 // 24 hours
	}
}));

// ENABLE CORS AND START SERVER
app.use(cors({ origin: true }));

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
// Disabled layout system since templates are standalone
// app.use(expressLayouts);
// app.set('layout', 'layout');
// app.set("layout extractScripts", true);
// app.set("layout extractStyles", true);

// Serve static assets from public directory at root
app.use(express.static(path.join(process.cwd(), 'public')));

// Simple test route
// app.get("/", (req, res) => {
// 	res.send("Hello World - Server is working!");
// });

// View routes (no authorization required)
app.use("/", views);

// Redirect /views/ to /
app.get("/views/", (req, res) => {
	res.redirect("/");
});

// Admin routes (no authorization required for local access)
app.use("/admin", admin);

// API routes (with authorization)
app.use("/foodtruck", isAuthorized, auth);
app.use("/foodtruck", isAuthorized, index);

// Initialize database
initDB();

app.listen(config.PORT || 3000, '0.0.0.0', () => {
	console.log(`Server started on port ${config.PORT || 3000}`);
	console.log(`Try: http://localhost:${config.PORT || 3000}`);
});



