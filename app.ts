import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/configSetup';

import { initDB } from './controllers/db';
import index from './routes/index';
import auth from './routes/auth';
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
initDB();
app.listen(config.PORT, () => {
	console.log(`Server started on port ${config.PORT}`);
});

// Routes
app.all('*', isAuthorized);
app.use("/foodtruck", auth);
app.use("/foodtruck", index);



