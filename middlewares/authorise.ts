
import { NextFunction, Response , Request} from "express";
import config from "../config/configSetup"
import { handleResponse } from "../helpers/utility";
import { verify } from "jsonwebtoken";



export const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
	//this is the url without query params
	const route: any = req.originalUrl.split('?').shift();
	let publicRoutes: string[] = config.PUBLIC_ROUTES!;

	if (publicRoutes.includes(route) || (publicRoutes.includes(`/${route.split('/')[1]}`) && !isNaN(route.split('/')[3]))) return next();

	let token: any = req.headers.authorization;

	if (!token) return handleResponse(res, 401, false, `Access Denied / Unauthorized request`);
	token = token.split(' ')[1]; // Remove Bearer from string
	if (token === 'null' || !token) return handleResponse(res, 401, false, `Unauthorized request`);

	let verified: any;
	try {
		verified = verify(token, config.JWTSECRET!);
	} catch (err: any) {
		// Malformed / expired / bad-signature tokens previously bubbled up and crashed
		// the Passenger response (502). Always answer with 401 instead.
		return handleResponse(res, 401, false, `Unauthorized request`);
	}
	if (!verified) return handleResponse(res, 401, false, `Unauthorized request`);

	(req as any).user = verified;
	next();
};