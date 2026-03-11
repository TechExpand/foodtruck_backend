// Import packages
import { Router } from "express";
import {
  apiIndex,
  cancelSubscription,
  createEvent,
  createMenu,
  createSubscription,
  deleteMenu,
  fetchRate,
  getAllCategories,
  getHomeEvents,
  getFirstFivePorpular,
  getHomeDetails,
  getLanLog,
  getMainVendorProfile,
  getMenu,
  getProfile,
  getUser,
  getVendorByTag,
  getVendorEvent,
  getVendorOrder,
  getVendorProfile,
  getVendorProfileV2,
  getVendorUserProfile,
  onlineLanlogUser,
  onlineLanlogVendors,
  rateProfile,
  reactivateSubscription,
  redeemPromo,
  sendTestEmailCon,
  updateEvent,
  updateLanLog,
  updateMenu,
  updateProfile,
  updateToken,
  vendorEvent,
  getReviews,
  vendorMenu,
} from "../controllers";
import { uploads } from "../helpers/upload";
import {
  confirmOrderV2,
  cancelOrderV2,
  deleteFavourite,
  getFavourite,
  getOrder,
  getOrderV2,
  getp,
  getTags,
  notifyOrder,
  notifyOrderV2,
  postFavourite,
  postOrder,
  postOrderV2,
  search,
  getDashboardStats,
  getNotifications,
} from "../controllers/favourite";

const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.get("/", apiIndex);
routes.post("/createsubscription", createSubscription);
routes.post("/redeem-promo", redeemPromo);
routes.get("/currentvendorslanlog", onlineLanlogVendors);
routes.get("/currentuserlanlog", onlineLanlogUser);
routes.get("/user", getUser);
// routes.delete("/user", deleteUser);
routes.get("/all-categories", getAllCategories);
routes.get("/profile", getVendorProfile);
routes.get("/profileV2", getVendorProfileV2);
routes.get('/get-vendor-profile', getMainVendorProfile)
routes.get("/vendor-profile", getVendorUserProfile);

routes.put("/profile", updateProfile);
routes.get("/locationprofile", getProfile);
routes.get("/locationmenu", vendorMenu);
routes.get("/locationevent", vendorEvent);
routes.get("/menu", getMenu);
routes.get("/get-home-details", getHomeDetails);
routes.get("/get-events", getHomeEvents);
routes.get("/get-vendor-event", getVendorEvent);
routes.get("/get-popular", getFirstFivePorpular);
routes.get("/get-reviews", getReviews);
routes.get("/get-favourite", getFavourite);
routes.post("/add-favourite", postFavourite);
routes.post("/add-order", postOrder);
routes.post("/add-order-v2", postOrderV2);
routes.get("/get-order", getOrder);
routes.get("/vendor-by-tags", getVendorByTag);
routes.get("/get-order-v2", getOrderV2);
routes.get("/notify-order", notifyOrder);
routes.post("/notify-orderV2", notifyOrderV2);
routes.post("/confirm-orderV2", confirmOrderV2);
routes.post("/cancel-orderV2", cancelOrderV2);
routes.post("/delete-favourite", deleteFavourite);
routes.get("/get-tags", getTags);
routes.get("/get-vendor-orders/:id", getVendorOrder)
routes.delete("/menu/:id", deleteMenu);
routes.post("/menu", createMenu);
routes.post("/event", uploads.single("menu_picture1"), createEvent);
routes.put("/menu", updateMenu);
routes.put("/event", uploads.single("menu_picture1"), updateEvent);
routes.post("/rating", rateProfile);
routes.get("/rating", fetchRate);
routes.get("/lanlog", getLanLog);
routes.get("/search", search);
routes.get("/getp", getp);
routes.get("/cancelsubscription", cancelSubscription);
routes.get("/activesubscription", createSubscription);
routes.get('/resumesubcription',  reactivateSubscription)
routes.put("/lanlog", updateLanLog);
routes.get("/token", updateToken);
routes.get("/notifications", getNotifications);
routes.get("/dashboard-stats", getDashboardStats)

routes.post("/sendTest", sendTestEmailCon);

export default routes;
