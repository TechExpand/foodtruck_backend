// Import packages
import { Sequelize } from 'sequelize-typescript';

// Import configs
import config from '../config/configSetup';
import { Users } from '../models/Users';
import { Verify } from '../models/Verify';
// import { Profession } from '../models/Profession';
// import { Professional } from '../models/Professional';
import { Profile } from '../models/Profile';
import { Menu } from '../models/Menus';
import { LanLog } from '../models/LanLog';
import { Events } from '../models/Event';
import { Tag } from '../models/Tag';
// import { Sector } from '../models/Sector';

// // Import models
// import {
	

// } from './models';


const sequelize = new Sequelize(config.DBNAME, config.DBUSERNAME, config.DBPASSWORD, {
	host: config.DBHOST,
	port: config.DBPORT,
	dialect: 'mysql',
	logging: false,
	dialectOptions: {
		ssl: { require: true, rejectUnauthorized: false },
	},
	models: [
		Users,
		Verify,
		Menu,
		LanLog,
		Events,
		Profile,
		Tag,
		
	],
});

const initDB = async () => {
	await sequelize.authenticate();
	await sequelize
		// .sync({})
		.sync({ alter: true })
		.then(async () => {
			console.log('Database connected!');
		})
		.catch(function(err: any) {
			console.log(err, 'Something went wrong with the Database Update!');
		});
};
export { sequelize, initDB };
