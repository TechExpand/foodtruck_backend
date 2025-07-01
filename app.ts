import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
// import expressLayouts from 'express-ejs-layouts';
import config from './config/configSetup';

import { initDB } from './controllers/db';
import index from './routes/index';
import auth from './routes/auth';
import views from './routes/views';
// const formidable = require('express-formidable');
import userAuth from './routes/auth';
// import vendorAuth from './vendorRoutes/auth';
import { isAuthorized } from './middlewares/authorise';


const app: Application = express();

app.use(morgan('dev'));

// PARSE JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(formidable())

// ENABLE CORS AND START SERVER
app.use(cors({ origin: true }));

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static assets from public directory at root
app.use(express.static(path.join(__dirname, 'public')));

initDB();
app.listen(config.PORT || 8000, () => {
	console.log(`Server started on port ${config.PORT || 8000}`);
});

// View routes (no authorization required)
app.use("/", views);

// API routes (with authorization)
app.all('*', isAuthorized);
app.use("/foodtruck", auth);
app.use("/foodtruck", index);


// app.all('*', isAuthorized);
// app.use("/foodtruck", auth);
// app.use("/foodtruck", index);



