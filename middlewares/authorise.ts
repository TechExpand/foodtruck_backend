
import { NextFunction, Response , Request} from "express";
import config from "../config/configSetup"
import { handleResponse } from "../helpers/utility";
import { verify } from "jsonwebtoken";
const TOKEN_SECRET = "222hwhdhnnjduru838272@@$henncndbdhsjj333n33brnfn";



export const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
	//this is the url without query params
	const route: any = req.originalUrl.split('?').shift();
	let publicRoutes: string[] = config.PUBLIC_ROUTES!;

	// console.log({ route , check1:publicRoutes.includes(route), publicRoutes})
	if (publicRoutes.includes(route) || (publicRoutes.includes(`/${route.split('/')[1]}`) && !isNaN(route.split('/')[3]))) return next();

	let token: any = req.headers.authorization;
	console.log(token)
	console.log("ddddd")
	if (!token) return handleResponse(res, 401, false, `Access Denied / Unauthorized request`);
		token = token.split(' ')[1]; // Remove Bearer from string
		
		if (token === 'null' || !token) return handleResponse(res, 401, false, `Unauthorized request`);
		let verified: any = verify(token, TOKEN_SECRET);
		if (!verified) return handleResponse(res, 401, false, `Unauthorized request`);
		// if (!businessPublicRoutes.includes(route) && !verified.businessId)
		// 	return handleResponse(res, 401, false, 'Unauthorized access to business resource');
		// if (verified.type === AuthIdentity.ADMIN) {
		// 	req.admin = verified;
		// } else {
		// 	req.user = verified;
		// }
        req.user = verified;
		next();

};