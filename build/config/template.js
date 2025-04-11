"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorWelcomeTemplate = exports.userWelcomeTemplate = exports.templateEmail = void 0;
const templateEmail = (subject, body) => {
    return `<!-- © 2024 Wingu Digital LLC. All rights reserved. -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;background-color:#f9f9f9" id="bodyTable">
        <tbody>
            <tr>
                <td style="padding-right:10px;padding-left:10px;" align="center" valign="top" id="bodyCell">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperWebview" style="max-width:600px">
                        <tbody>
                            <tr>
                                <td align="center" valign="top">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tbody>
                                            <tr>
                                                <td style="padding-top: 20px; padding-bottom: 20px; padding-right: 0px;" align="right" valign="middle" class="webview"> <a href="https://foodtruck.express" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:right;text-decoration:underline;padding:0;margin:0" target="_blank" class="text hideOnMobile">All Aboard the FoodTruck Express! →</a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperBody" style="max-width:600px">
                        <tbody>
                            <tr>
                                <td align="center" valign="top">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableCard" style="background-color:#fff;border-color:#e5e5e5;border-style:solid;border-width:0 1px 1px 1px;">
                                        <tbody>
                                            <tr>
                                                <td style="background-color:#00d2f4;font-size:1px;line-height:3px" class="topBorder" height="3">&nbsp;</td>
                                            </tr>

                                            <tr>
                                                <td style="padding-bottom: 20px;" align="center" valign="top" class="imgHero">
                                                    <a href="#" style="text-decoration:none" target="_blank">
                                                        <img alt="" border="0" src="https://foodtruck.express/img/icon.png" style="width:100%;max-width:300px;height:auto;display:block;color: #f9f9f9;" width="300">
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-bottom: 5px; padding-left: 20px; padding-right: 20px;" align="center" valign="top" class="mainTitle">
                                                    <h2 class="text" style="color:#000;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:28px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:36px;text-transform:none;text-align:center;padding:0;margin:0">${subject}</h2>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-bottom: 30px; padding-left: 20px; padding-right: 20px;" align="center" valign="top" class="subTitle">
                                                    <h4 class="text" style="color:#999;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:16px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:24px;text-transform:none;text-align:left;padding:0;margin:0"><center>${body}</center></h4>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-left:20px;padding-right:20px" align="center" valign="top" class="containtTable ui-sortable">
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableDescription" style="">
                                                        <tbody>
                                                            <tr>
                                                                <td style="padding-bottom: 20px;" align="center" valign="top" class="description">
                                                                    <p class="text" style="color:#666;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:22px;text-transform:none;text-align:center;padding:0;margin:0">Welcome aboard the FoodTruck.Express!</p>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableButton" style="">
                                                        <tbody>
                                                            <tr>
                                                                <td style="padding-top:20px;padding-bottom:20px" align="center" valign="top">
                                                                    <table border="0" cellpadding="0" cellspacing="0" align="center">
                                                                        <tbody>
                                                                            <tr>


                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="font-size:1px;line-height:1px" height="20">&nbsp;</td>
                                            </tr>

                                        </tbody>
                                    </table>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="space">
                                        <tbody>
                                            <tr>
                                                <td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperFooter" style="max-width:600px">
                        <tbody>
                            <tr>
                                <td align="center" valign="top">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="footer">
                                        <tbody>
                                            <tr>
                                                <td style="padding-top:10px;padding-bottom:10px;padding-left:10px;padding-right:10px" align="center" valign="top" class="socialLinks">
                                                    <a href="https://www.facebook.com/theFoodTruckExpress" style="display:inline-block" target="_blank" class="facebook">
                                                        <img alt="" border="0" src="https://foodtruck.express/img/facebook.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                                    </a>
                                                    <!-- <a href="#twitter-link" style="display: inline-block;" target="_blank" class="twitter">
                                                        <img alt="" border="0" src="https://foodtruck.express/img/twitter.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                                    </a>
                                                    <a href="#pintrest-link" style="display: inline-block;" target="_blank" class="pintrest">
                                                        <img alt="" border="0" src="https://foodtruck.express/img/pintrest.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                                    </a> -->
                                                    <a href="https://www.instagram.com/food_truck_express" style="display: inline-block;" target="_blank" class="instagram">
                                                        <img alt="" border="0" src="https://foodtruck.express/img/instagram.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                                    </a>
                                                    <!-- <a href="#linkdin-link" style="display: inline-block;" target="_blank" class="linkdin">
                                                        <img alt="" border="0" src="https://foodtruck.express/img/linkdin.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                                    </a> -->
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 10px 10px 5px;" align="center" valign="top" class="brandInfo">
                                                    <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">©&nbsp;Wingu Digital LLC. | wingudigital.com </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 0px 10px 20px;" align="center" valign="top" class="footerLinks">
                                                    <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0;flex-direction:row;justify-content:center;"><a href="https://wingudigital.com" target="_blank">
        <img src="https://foodtruck.express/wp-content/uploads/2024/01/wingu-google-app-logo.png" alt="Wingudigital" width="30" height="30">
    </a></br><a href="https://foodtruck.express/privacy-policy/" style="color:#bbb;text-decoration:underline" target="_blank">Privacy Policy</a>
                                                    </p>
                                                    
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 0px 10px 10px;" align="center" valign="top" class="footerEmailInfo">
                                                    <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">If you have any comments, questions, or suggestions please contact us <a href="mailto:support@foodtruck.express" style="color:#bbb;text-decoration:underline" target="_blank">support@foodtruck.express</a>
                                                        <br> <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Unsubscribe</a> from our mailing lists</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top:10px;padding-bottom:10px;padding-left:10px;padding-right:10px" align="center" valign="top" class="appLinks">
                                                    <a href="https://play.google.com/store/apps/details?id=com.express.foodtruck" style="display: inline-block;" target="_blank" class="play-store">
                                                        <img alt="" border="0" src="https://foodtruck.express/img/play-store.png" style="height:auto;margin:5px;width:100%;max-width:120px" width="120">
                                                    </a>
                                                    <a href="https://apps.apple.com/us/app/foodtruck-express/id1583754395" style="display: inline-block;" target="_blank" class="app-store">
                                                        <img alt="" border="0" src="https://foodtruck.express/img/app-store.png" style="height:auto;margin:5px;width:100%;max-width:120px" width="120">
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>`;
};
exports.templateEmail = templateEmail;
const userWelcomeTemplate = () => {
    return `Welcome aboard the FoodTruck Express community! 🎉<br><br>
    
    
           Your account has been successfully created, and you are now part of a vibrant community.<br>
           
           
           Welcome aboard, food truck operators! We're thrilled to have you on board and excited to help you connect with hungry customers in your area.  <br>With real-time access to your location through our app, you'll attract hungry customers like never before. Let's hit the road together and bring the joy of delicious food to every corner of the city!<br>
           
           Here's what you can expect with foodtruck.express:<br><br>
           Reach a wider audience 🌟: Showcase your mouthwatering dishes to a vast audience of hungry app users craving fantastic street eats.<br>
           
           Effortless management 📲: Easily update your menu, location, and operating hours through our user-friendly app.<br>
           
           Increase sales 💰: Harness the power of our integrated location system, enabling customers to easily find and flock to your truck.<br>
           
           Cultivate your brand 🌱: Cultivate your reputation with valuable customer feedback, participate in curated events, and host your own promotions to captivate an even larger audience of food truck enthusiasts.<br><br>
           
           Ready to Roll?<br><br>
           
           Once you  familiarize yourself with the platform, update your profile with your delicious menu. Let your social followers know that they can now find you in real time with the FoodTruck.Express platform!   We can't wait to see you hitting the streets and serving up amazing food!<br><br>
           
           
           Have questions?<br><br>
           
           
           Our dedicated support team is always happy to help. Feel free to reach out to us at support@foodtruck.express anytime. Welcome to the Foodtruck.Express family!<br>
           
           
            Best, The Foodtruck.Express Team<br><br>`;
};
exports.userWelcomeTemplate = userWelcomeTemplate;
const vendorWelcomeTemplate = () => {
    return `Welcome aboard the FoodTruck Express community! 🎉<br><br>
              
              
              Your account has been successfully created, and you are now part of a vibrant community.<br><br>
              
              
              We’re thrilled to have you join us on this exciting culinary adventure. Get ready to discover, order, and savor the best food truck experiences in your city!<br><br>
              
              
              Here's a quick guide to kickstart your FoodTruck.Express journey:<br>
              🚚 Locate & Love: Use our app to find your favorite food trucks on the move. Whether you’re craving tacos, pizza, or something exotic, we’ve got you covered.<br>
              
              🌮 Share the Love: Have a fantastic experience? Share the FoodTruck Express love with friends and family. The more, the merrier!<br>
              
              🎉 Exclusive Updates: Stay in the loop! Receive updates on citywide food truck events and exclusive offers. Don’t miss out on any flavor-filled festivities.<br>
              
              Feel free to explore, share, and let us know how we can make your FoodTruck Express experience even better. Your feedback matters!<br><br>
              
              
              Happy exploring and happy eating!<br><br>
              
              
              Best, The FoodTruck Express Team 🍔🍕🌯<br><br>
              
              
              P.S. Spread the word! Tell your friends about FoodTruck Express and let’s build a community of foodies together. Sharing is caring!<br>`;
};
exports.vendorWelcomeTemplate = vendorWelcomeTemplate;
//# sourceMappingURL=template.js.map