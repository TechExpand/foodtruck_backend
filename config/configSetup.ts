import * as dotenv from 'dotenv';
dotenv.config();

type Config = {
	NODE_ENV: string | undefined;
	PORT: number | undefined;
	SSL: boolean | undefined;
	JWTSECRET: string | undefined;
	JWT_EXPIRY_TIME: string | undefined;
	DBNAME: any;
	DBUSERNAME: any | undefined;
	DBPASSWORD: string | undefined;
	RESEND: string | undefined;
	DBHOST: string | undefined;
	DBPORT: number | undefined;
	DBDIALECT: string | undefined;
	MAIL_FROM: string | undefined;
	SUPPORT_MAIL: string | undefined;
	SUPPORT_PHONE: string | undefined;
	MAIL_FROM_NAME: string | undefined;
	LOGO: string | undefined;
	WEBSITE: string | undefined;
	BASE_API_URL: string | undefined;
	REDIS_INSTANCE_URL: string | undefined;
	PUBLIC_ROUTES: string[] | [];
	BUSINESS_PUBLIC_ROUTES: string[] | [];
};

const getConfig = (): Config => {
	return {
		NODE_ENV: process.env.NODE_ENV,
		PORT: Number(process.env.PORT),
		SSL: true,
		JWTSECRET: process.env.JWTSECRET,
		JWT_EXPIRY_TIME: process.env.JWT_EXPIRY_TIME,
		DBNAME: process.env.DBNAME,
		DBUSERNAME: process.env.DBUSERNAME,
		DBPASSWORD: process.env.DBPASSWORD,
		DBHOST: process.env.DBHOST,
		DBPORT: Number(process.env.DBPORT),
		RESEND: process.env.RESEND,
		DBDIALECT: process.env.DBDIALECT,
		MAIL_FROM: process.env.MAIL_FROM,
		SUPPORT_MAIL: process.env.SUPPORT_MAIL,
		SUPPORT_PHONE: process.env.SUPPORT_PHONE,
		MAIL_FROM_NAME: process.env.MAIL_FROM_NAME,
		LOGO: process.env.LOGO,
		WEBSITE: process.env.WEBSITE,
		BASE_API_URL: process.env.BASE_API_URL,
		REDIS_INSTANCE_URL: process.env.REDIS_INSTANCE_URL,
		PUBLIC_ROUTES: [
			"/foodtruck/users/",
			"/foodtruck/",
			'/foodtruck/alltags',
			'/foodtruck/search',
			'/foodtruck/get-home-details',
			'/foodtruck/currentvendorslanlog',
			'/foodtruck/locationprofile',
			'/foodtruck/locationevent',
			'/foodtruck/locationmenu',
			
			"/foodtruck/email/",
			"/foodtruck/users/validate/",
			'/foodtruck/verify-otp',
			'/foodtruck/send-otp',
			'/foodtruck/change-password',
			// '/foodtruck/lanlog',
			"/foodtruck/token/login/"

		],
		BUSINESS_PUBLIC_ROUTES: [

		],
	};
};

const getSanitzedConfig = (config: Config) => {
	for (const [key, value] of Object.entries(config)) {
		if (value === undefined) {
			throw new Error(`Missing key ${key} in .env`);
		}
	}
	return config as Config;
};

const config = getConfig();
const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;
