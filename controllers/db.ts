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
import { PopularVendor } from '../models/Popular';
import { SpecialTag } from '../models/SpecialTag';
import { Favourite } from '../models/Favourite';
import { AllTag } from '../models/Alltags';
import { Order } from '../models/Order';
import { Extra } from '../models/Extras';
import { Rating } from '../models/Rate';
import { CartProduct } from '../models/CartProduct';
import { OrderV2 } from '../models/OrderV2';
import { ProfileViews } from '../models/ProfileViews';
import { Notification } from '../models/Notification';
import { FeaturedEventTrucks } from '../models/FeaturedEventTrucks';



const sequelize = new Sequelize(config.DBNAME, config.DBUSERNAME, config.DBPASSWORD, {
	host: config.DBHOST,
	port: config.DBPORT,
	dialect: 'mysql',
	logging: false,
	dialectOptions: {
		// ssl: { require: true, rejectUnauthorized: false },
		ssl: false
	},
	models: [
		Users,
		FeaturedEventTrucks,
		AllTag,
		Notification,
		Verify,
		Rating,
		Favourite,
		Menu,
		CartProduct,
		SpecialTag,
		OrderV2,
		Extra,
		Order,
		PopularVendor,
		LanLog,
		Events,
		Profile,
		Tag,
		ProfileViews
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
