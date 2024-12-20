
// @ts-nocheck comment

import { errorResponse, getDistanceFromLatLonInKm, successResponse } from "../helpers/utility";
import { Request, Response } from 'express';
import { LanLog } from "../models/LanLog";
import { Profile } from "../models/Profile";


import Stripe from 'stripe';
import config  from "../config/configSetup";
import { UserType, Users } from "../models/Users";
import {CartProduct} from "../models/CartProduct";
import { Menu } from "../models/Menus";
import { Events } from "../models/Event";
import { PopularVendor } from "../models/Popular";
import { Tag } from "../models/Tag";
import { HomeTag } from "../models/HomeTag";
import { Favourite } from "../models/Favourite";
import { AllTag } from "../models/Alltags";
import { Op, Sequelize } from "sequelize";
import { sequelize } from "./db";
import { Order } from "../models/Order";
import { Extra } from "../models/Extras";
import { sendEmailResend, sendTestEmail } from "../services/sms";
import { templateEmail } from "../config/template";
import { sendToken } from "../services/notification";
import { Rating } from "../models/Rate";
import { OrderV2 } from "../models/OrderV2";

const cloudinary = require("cloudinary").v2;
const stripe = new Stripe(config.STRIPE_SK, {
    apiVersion: '2023-08-16',
});






export const apiIndex = async (req: Request, res: Response) => successResponse(res, 'API Working!');



export const createLocation = async (req: Request, res: Response) => {
    let { Lan, Log, online } = req.body;
    let { id } = req.user;
    const user = await Users.findOne({ where: { id } })
    const lanlog = await LanLog.findOne({ where: { userId: id } })
    if (lanlog) {
        await lanlog.update({ Lan, Log, type: user?.type})
        return res.status(200).send({ message: "Created Successfully", status: true })
    } else {
        const location = await LanLog.create({ Lan, Log, online, userId: id, type: user?.type })
        return res.status(200).send({ message: "Created Successfully", status: true })
    }
}



export const createProfile = async (req: Request, res: Response) => {
    let { business_name, unique_detail, detail, phone, tag } = req.body;
    let { id } = req.user;
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path.replace(/ /g, "_"))
        const user = await Users.findOne({ where: { id } })
        const location = await LanLog.findOne({ where: { userId: id } })
        const profile = await Profile.create({
            business_name, unique_detail, detail,
            phone, lanlogId: location!.id, userId: id,
            pro_pic: result.secure_url, tag,
        })
        return res.status(200).send({ message: "Created Successfully", status: true })
    }
    return res.status(400).send({ message: "File is required", status: false })

}



export const updateToken = async (req: Request, res: Response) => {
    let { id } = req.user;
    let { fcmToken } = req.body;
    const user = await Users.findOne({ where: { id } })
    await user?.update({ fcmToken })
    return res.status(200).send({ message: "Updated Successfully", status: true })
}



export const updateProfile = async (req: Request, res: Response) => {
    let { business_name, unique_detail, detail, phone, tag } = req.body;
    let { id } = req.user;
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path.replace(/ /g, "_"))
        const location = await LanLog.findOne({ where: { userId: id } })
        const profile = await Profile.findOne({ where: { userId: id } })
        await profile?.update({
            business_name: business_name ?? profile.business_name,
            unique_detail: unique_detail ?? profile.unique_detail, detail: detail ?? profile.detail,
            phone: phone ?? profile.phone, lanlogId: location!.id, userId: id,
            pro_pic: result.secure_url,
            tag: tag ?? profile.tag
        })
        return res.status(200).send({ message: "Updated Successfully", status: true })
    } else {
        const location = await LanLog.findOne({ where: { userId: id } })
        const profile = await Profile.findOne({ where: { userId: id } })
        await profile?.update({
            business_name: business_name ?? profile.business_name,
            unique_detail: unique_detail ?? profile.unique_detail, detail: detail ?? profile.detail,
            phone: phone ?? profile.phone, lanlogId: location!.id, userId: id,
            pro_pic: profile.pro_pic,
            tag: tag ?? profile.tag
        })
        return res.status(200).send({ message: "Updated Successfully", status: true })
    }


}



export const createSubscription = async (req: Request, res: Response) => {
    let { paymentMethod } = req.query;
    // console.log(`${card_number}, ${exp_month}, ${exp_year}, ${cvc}`)
    let { id } = req.user;
    try {
        const user = await Users.findOne({ where: { id } })
        const profile = await Profile.findOne({ where: { userId: user?.id } })
        const customer = await stripe.customers.create({
            email: user!.email,
            payment_method: paymentMethod,
            invoice_settings: {
                default_payment_method: paymentMethod,
            }
        })
        console.log(customer.id)
        const subscription = await stripe.subscriptions.create({
            customer: String(customer.id),
            items: [
                {
                    'price': config.PRICE_ID,
                    'quantity': 1,
                },
            ],
            default_payment_method: paymentMethod,
            payment_settings: {
                payment_method_options: {
                    card: {
                        request_three_d_secure: 'any',
                    },
                },
                payment_method_types: ['card'],
                save_default_payment_method: 'on_subscription',
            },
            expand: ['latest_invoice.payment_intent'],
            trial_period_days: 1
        })
        await user?.update({
            customer_id: customer.id,
            subscription_id: subscription.id
        })
        await profile?.update({ subcription_id: subscription.id })
        if (subscription.latest_invoice.payment_intent) {
            return res.status(200).send({
                message: "Created Successfully",
                clientSecret: subscription.latest_invoice.payment_intent.client_secret,
                subscriptionId: subscription.id,
                status: true
            })
        } else {
            return res.status(200).send({
                message: "Created Successfully",
                subscriptionId: subscription.id,
                status: true
            })
        }

    } catch (e) {
        console.log(e.message)
        return res.status(400).send({
            message: e.message,
            status: false
        })
    }
}






export const cancelSubscription = async (req: Request, res: Response) => {
    let { id } = req.user;
    const user = await Users.findOne({ where: { id } })
    const subscription = await stripe.subscriptions.cancel(user!.subscription_id)
    const status = await stripe.subscriptions.retrieve(user!.subscription_id)
    return res.status(200).send({ message: "Canceled Successfully", status: status.status })
}






export const reactivateSubscription = async (req: Request, res: Response) => {
    let { id } = req.user;
    const user = await Users.findOne({ where: { id } })
    const subscription = await stripe.subscriptions.resume(user!.subscription_id)
    return res.status(200).send({ message: "You have subscribed to foodtruck.express plan", status: true })
}




export const addNewCard = async (req: Request, res: Response) => {
    let { card_number, expiry_month, expiry_year, cvc } = req.query;
    let { id } = req.user;
    const user = await Users.findOne({ where: { id } })
    const profile = await Profile.findOne({ where: { userId: user?.id } })

    const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
            number: String(card_number),
            exp_month: exp_month,
            exp_year: exp_year,
            cvc: String(cvc),
        },
    });

    await stripe.paymentMethods.attach(
        paymentMethod.id,
        { customer: user!.customer_id }
    );
    await user?.update({ token_id: token.id, card_id: token.card?.id })
    return res.status(200).send({ message: "Created Successfully", status: true })
}






export const onlineLanlogVendors = async (req: Request, res: Response) => {
    const { lan, log, range_value } = req.query
    let distance_list: any[] = []
    const lanlog = await LanLog.findAll({
        where: {
            type: UserType.VENDOR
        },
        include: [{
            model: Users,
            where: {
                type: UserType.VENDOR
            },
            attributes: [
                'createdAt', 'updatedAt', "email", 'type']
        }
        ],
    });

    for (let vendor of lanlog) {
        const distance = getDistanceFromLatLonInKm(
            Number(vendor.Lan), Number(vendor.Log), Number(lan), Number(log)
        );
        // 500

        if (distance <= Number(15)) {
            if (vendor.dataValues.user.dataValues.type == UserType.VENDOR) {
                distance_list.push({
                    ...vendor.dataValues,
                    user: vendor.dataValues.user.dataValues,
                    distance,
                })
                distance_list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
            }
        }

    }
    return res.status(200).send({ message: "Fetched Successfully", vendors: distance_list })
}







export const onlineLanlogUser = async (req: Request, res: Response) => {
    const { lan, log, range_value } = req.query
    const { id } = req.user
    const user = await Users.findOne({ where: { id } })

    try {
        const subscription = await stripe.subscriptions.retrieve(user?.subscription_id)
        if (subscription.status == 'active' || subscription.status == 'trialing') {
            let distance_list: any[] = []
            const lanlog = await LanLog.findAll({
                where: {
                    type: UserType.USER
                },
                include: [{
                    model: Users,
                    where: {
                        type: UserType.USER
                    },
                    attributes: [
                        'createdAt', 'updatedAt', "email", "type"]
                }
                ],
            });



            for (let user of lanlog) {
                const distance = getDistanceFromLatLonInKm(
                    Number(user.Lan), Number(user.Log), Number(lan), Number(log)
                );


                if (distance <= Number(15)) {

                    if (user.dataValues.user.dataValues.type == UserType.USER) {

                        distance_list.push({
                            ...user.dataValues,
                            user: user.dataValues.user.dataValues,
                            distance,
                        })
                        distance_list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
                    }
                }

            }

            return res.status(200).send({ message: "Fetched Successfully", users: distance_list })
        } else {
            return res.status(200).send({ message: "Fetched Successfully", users: "Subscribe to view online User locations and Display your Menu on your profile" })

        }
    } catch (e) {
        return res.status(200).send({ message: "Fetched Successfully", users: "Subscribe to view online User locations and Display your Menu on your profile" })
    }
}






export const getProfile = async (req: Request, res: Response) => {
    const { id } = req.query
    const profile = await Profile.findAll({ where: { lanlogId: id } });
    return res.status(200).send({ message: "Fetched Successfully", profile })
}




export const getFirstFiveEvents = async (req: Request, res: Response) => {
    const currentDate = new Date();
    const event = await Events.findAll({
        where: {
            formated_date: {
                [Sequelize.Op.gt]: currentDate,
            },
        },
        include: [{ model: Users, include: [{ model: Profile }] }]
    });
    return res.status(200).send({ message: "Fetched Successfully", event })
}




export const getVendorEvent = async (req: Request, res: Response) => {
    const { id } = req.user;
    const event = await Events.findAll({
        where: {
            userId: id
        }
    });
    return res.status(200).send({ message: "Fetched Successfully", event })
}





export const filterVendorBytag = async (req: Request, res: Response) => {
    const { tag } = req.query;
    const profile = await Profile.findAll({
        where: { tag: tag?.toString().toLowerCase() }, include: [
            { model: Users }, { model: LanLog }
        ]
    });
    return res.status(200).send({ message: "Fetched Successfully", profile })
}




export const getFirstFivePorpular = async (req: Request, res: Response) => {
    const popular = await PopularVendor.findAll({ limit: 10 });
    return res.status(200).send({ message: "Fetched Successfully", popular })
}








export const getTags = async (req: Request, res: Response) => {
    const tags = await Tag.findAll({});
    return res.status(200).send({ message: "Fetched Successfully", tags })
}



export const getUser = async (req: Request, res: Response) => {
    const { id } = req.user

    const user = await Users.findAll({
        where: { id }
    });
    return res.status(200).send({
        message: "Fetched Successfully", user
    })
}




export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.user
    const user = await Users.findOne({
        where: { id }
    });
    const profile = await Profile.findOne({
        where: { userId: user?.id }
    });
    if(profile){
        await profile.destroy()
        await user.destroy()
    }else{
        await user.destroy()
    }
    return res.status(200).send({
        message: "Fetched Successfully"
    })
}





export const getAllTags = async (req: Request, res: Response) => {
    const tags = await AllTag.findAll({
        where: {}
    });
    return res.status(200).send({
        message: "Fetched Successfully", tags
    })
}


export const getVendorProfileV2 = async (req: Request, res: Response) => {
    const { id } = req.user
    const profile = await Profile.findOne({
        where: { userId: id }, include: [
            { model: Users },
            { model: LanLog },

        ],
    });
    const menus = await Menu.findAll({
        where: { userId: id }, include: [
            { model: Extra }
        ]
    })


    const events = await Events.findAll({ where: { userId: id } })
    const order = await OrderV2.findAll({
        where: { profileId: profile?.id }, 
        include: [
            { model: Profile, include: [{ model: LanLog }] },
            { model: Users },
            { model: CartProduct , include: [{model: Menu}]},
        ]
    })
    return res.status(200).send({
        message: "Fetched Successfully", profile: {
            menus,
            events,
            order,
            profile: profile
        }
    })

}



export const getVendorProfile = async (req: Request, res: Response) => {
    const { id } = req.user
    const profile = await Profile.findOne({
        where: { userId: id }, include: [
            { model: Users },
            { model: LanLog },

        ],
    });
    const menus = await Menu.findAll({
        where: { userId: id }, include: [
            { model: Extra }
        ]
    })


    const events = await Events.findAll({ where: { userId: id } })
    const order = await Order.findAll({
        where: { profileId: profile?.id }, include: [
            { model: Menu },
            { model: Users },
        ],
    })
    return res.status(200).send({
        message: "Fetched Successfully", profile: {
            menus,
            events,
            order,
            profile: profile
        }
    })

}






export const getSubscription = async (req: Request, res: Response) => {
    try {
        const { id } = req.user
        const user = await Users.findOne({ where: { id } });
        const subscription = await stripe.subscriptions.retrieve(user?.subscription_id)
        return res.status(200).send({ message: "Fetched Successfully", status: subscription.status })
    } catch (error) {
        return res.status(200).send({ message: "Fetched Successfully", status: "null" })
    }

}





export const getLanLog = async (req: Request, res: Response) => {
    const { id } = req.user
    const lanlog = await LanLog.findAll({
        where: { userId: id }, include: [{
            model: Users,
            attributes: [
                'createdAt', 'updatedAt', "subscription_id"]
        }
        ],
    });
    return res.status(200).send({ message: "Fetched Successfully", lanlog })
}





export const updateLanLog = async (req: Request, res: Response) => {
    const { id, online } = req.body
    const lanlog = await LanLog.findOne({ where: { id } });
    await lanlog?.update({ online })
    return res.status(200).send({ message: "Fetched Successfully", lanlog })
}




export const rateProfile = async (req: Request, res: Response) => {
    const { id, rate } = req.body
    const profile = await Profile.findOne({ where: { id } });
    const truckUser = await Users.findOne({ where: { id: profile.userId } })
    await Rating.create({
        profileId: profile?.id, rate, truckId: truckUser?.id, userId: req.user.id
    })
    await profile?.update({ totalRate: profile.totalRate + 1, meanRate: profile.meanRate + Number(rate), rate: ((profile.meanRate + Number(rate)) / (profile.totalRate + 1)) })
    return res.status(200).send({ message: "Fetched Successfully", profile })
}



export const fetchRate = async (req: Request, res: Response) => {
    const { id } = req.query
    const rate = await Rating.findAll({ where: { userId: req.user.id, profileId: id } });
    return res.status(200).send({ message: "Fetched Successfully", rate })
}



export const vendorMenu = async (req: Request, res: Response) => {
    const { id } = req.query
    const user = await Users.findOne({ where: { id } })
    const profile = await Profile.findOne({ where: { userId: user?.id } })
    const menu = await Menu.findAll({
        where: { userId: id }, include: [{ model: Extra }]
    })

    // temp code
    // return res.status(200).send({
    //     message: "Fetched Successfully",
    //     menu
    // })

    stripe.subscriptions.retrieve(user?.subscription_id).then(
        function (subscription_status) {
            if (subscription_status.status == 'active' || subscription_status.status == 'trialing') {

                return res.status(200).send({
                    message: "Fetched Successfully",
                    menu
                })
            } else {
                sendToken(user?.id, `Foodtruck.express`.toUpperCase(),
                    `Hey ${profile?.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`
                );
                sendEmailResend(`${user?.email}`,
                    "Foodtruck.express".toUpperCase(),
                    templateEmail(`${user?.email}`, `Hey ${profile?.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`))
                return res.status(200).send({ message: "VENDOR MENU IS UNAVAILABLE", status: false })
            }
        },
        function (err) {
            if (err instanceof Stripe.errors.StripeError) {
                // Break down err based on err.type

                sendToken(user?.id, `Foodtruck.express`.toUpperCase(),
                    `Hey ${profile?.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`
                );
                sendEmailResend(`${user?.email}`,
                    "Foodtruck.express".toUpperCase(),
                    templateEmail(`${user?.email}`, `Hey ${profile?.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`))

                console.log(err.type)
                return res.status(200).send({ message: "VENDOR MENU IS UNAVAILABLE", status: false })
            } else {

                // ...
                sendToken(user?.id, `Foodtruck.express`.toUpperCase(),
                    `Hey ${profile?.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`
                );
                sendEmailResend(`${user?.email}`,
                    "Foodtruck.express".toUpperCase(),
                    templateEmail(`${user?.email}`, `Hey ${profile?.business_name}, Customers are trying to view your menu on foodtruck.express, subscribe to make it available.`))
                console.log(err)
                return res.status(200).send({ message: "VENDOR MENU IS UNAVAILABLE", status: false })
            }
        }
    );

}





export const vendorEvent = async (req: Request, res: Response) => {
    const { id } = req.query
    const user = await Users.findOne({ where: { id } })
    const event = await Events.findAll({
        where: { userId: id }, include: [
            { model: Users, include: [{ model: Profile }] }
        ]
    })
    console.log(user?.subscription_id)
    const subscription_status = await stripe.subscriptions.retrieve(user?.subscription_id).then(
        function (subscription_status) {
            if (subscription_status.status == 'active' || subscription_status.status == 'trialing') {
                // const menu = await Menu.findAll({ where: { userId: id }, include: [{ model: Extra }] })
                return res.status(200).send({
                    message: "Fetched Successfully",
                    event
                })

            } else {
                return res.status(200).send({ message: "VENDOR EVENT IS UNAVAILABLE", status: false })
            }
        },
        function (err) {
            if (err instanceof Stripe.errors.StripeError) {
                // Break down err based on err.type
                console.log(err.type)
                return res.status(200).send({ message: "VENDOR EVENT IS UNAVAILABLE", status: false })
            } else {
                // ...
                console.log(err)
                return res.status(200).send({ message: "VENDOR EVENT IS UNAVAILABLE", status: false })
            }
        }
    )

}






export const getMenu = async (req: Request, res: Response) => {
    const { id } = req.user
    const user = await Users.findOne({ where: { id } })
    console.log(user?.subscription_id)
    const menu = await Menu.findAll({ where: { userId: id } })
    return res.status(200).send({ message: "Fetched Successfully", menu })
}





export const getHomeDetails = async (req: Request, res: Response) => {
    const tags = await HomeTag.findAll({ include: [{ model: Tag }] });
    const profileSecondTag = await Profile.findAll({
        where: {
            [Op.or]: [
                { 'tag': { [Op.like]: '%' + `${tags[0].dataValues.tag.title?.toString().toLowerCase()}` + '%' } },
            ]
        }, include: [
            { model: Users }, { model: LanLog }
        ]
    });
    const profileFirstTag = await Profile.findAll({
        where: {
            [Op.or]: [
                { 'tag': { [Op.like]: '%' + `${tags[1].dataValues.tag.title?.toString().toLowerCase()}` + '%' } },
            ]
        },
        include: [
            { model: Users }, { model: LanLog }
        ]
    });
    const currentDate = new Date();
    console.log(currentDate)
    const event = await Events.findAll({
        where: {
            formated_date: {
                [Sequelize.Op.gte]: currentDate,
            },
        },
        include: [{ model: Users, include: [{ model: Profile }] }]
    });
    const popular = await PopularVendor.findAll({
        limit: 10,
        include: [
            {
                model: Profile, include: [
                    { model: Users }, { model: LanLog }
                ]
            }
        ]
    });


    // Manipulate the data to add a custom field
    const modifiedData = profileFirstTag.map(item => {
        // Add a custom field to each item in the list
        return {
            ...item.get(), // Retrieve the item as a plain object
            number: 1, // Add your custom field here
        };
    });

    // Manipulate the data to add a custom field
    const modifiedData2 = profileSecondTag.map(item => {
        // Add a custom field to each item in the list
        return {
            ...item.get(), // Retrieve the item as a plain object
            number: 2, // Add your custom field here
        };
    });

    return res.status(200).send({
        vendors: modifiedData.concat(modifiedData2),
        message: "Fetched Successfully",
        event,
        popular,
        tags
    })
}






export const deleteMenu = async (req: Request, res: Response) => {
    const { id } = req.params
    const menu = await Menu.findOne({ where: { id } })
    await menu?.destroy()
    return res.status(200).send({ message: "Deleted Successfully", menu })
}







export const createMenu = async (req: Request, res: Response) => {
    const { id } = req.user
    const { menu_title, menu_description, menu_price, extra } = req.body


    const user = await Users.findOne({ where: { id } })
    const lanlog = await LanLog.findOne({ where: { userId: user?.id } })
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path.replace(/ /g, "_"))
        console.log({
            menu_title, menu_description, menu_price,
            lanlogId: lanlog?.id,
            userId: user?.id,
            menu_picture: result.secure_url
        })
        const menu = await Menu.create(
            {
                menu_title, menu_description, menu_price,
                lanlogId: lanlog?.id,
                userId: user?.id,
                menu_picture: result.secure_url
            }
        );

        let valueExtra = [];
        for (let value of extra) {
            valueExtra.push({
                extra_title: value.extra_title,
                extra_description: value.extra_description,
                extra_price: value.extra_price,
                menuId: menu.id
            })
        }
        await Extra.bulkCreate(valueExtra)
        return res.status(200).send({ message: "Created Successfully", menu })
    } else {
        return res.status(400).send({ message: "Image is Required" })
    }

}







export const updateMenu = async (req: Request, res: Response) => {
    const { id } = req.query
    // console.log(userId);
    const { menu_title, menu_description, menu_price, extra } = req.body

    const user = await Users.findOne({ where: { id: req.user.id } })
    const lanlog = await LanLog.findOne({ where: { userId: user?.id } })
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path.replace(/ /g, "_"))
        const menu = await Menu.findOne({ where: { id } })
        const extras = await Extra.findAll({ menuId: id })
        let ids = []
        for (let value of extras) {
            ids.push(value.id)
        }

        await Extra.destroy({ where: { id: ids } })
        await menu.update(
            {
                menu_title: menu_title ?? menu?.menu_title, menu_description: menu_description ?? menu?.menu_description,
                menu_price: menu_price ?? menu?.menu_price,
                lanlogId: lanlog?.id,
                userId: user?.id,
                menu_picture: result.secure_url
            }
        );
        let valueExtra = [];
        for (let value of extra) {
            valueExtra.push({
                extra_title: value.extra_title,
                extra_description: value.extra_description,
                extra_price: value.extra_price,
                menuId: menu.id
            })
        }
        await Extra.bulkCreate(valueExtra)
        return res.status(200).send({ message: "Updated Successfully", menu })
    } else {

        const menu = await Menu.findOne({ where: { id } })
        const extras = await Extra.findAll({ menuId: id })
        let ids = []
        for (let value of extras) {
            ids.push(value.id)
        }
        await Extra.destroy({ where: { id: ids } })
        await menu.update(
            {
                menu_title: menu_title ?? menu?.menu_title, menu_description: menu_description ?? menu?.menu_description,
                menu_price: menu_price ?? menu?.menu_price,
                lanlogId: lanlog?.id,
                userId: user?.id,
                menu_picture: menu.menu_picture
            }
        );
        let valueExtra = [];
        for (let value of extra) {
            valueExtra.push({
                extra_title: value.extra_title,
                extra_description: value.extra_description,
                extra_price: value.extra_price,
                menuId: menu.id
            })
        }
        await Extra.bulkCreate(valueExtra)
        return res.status(200).send({ message: "Updated Successfully", menu })
    }

}






export const updateEvent = async (req: Request, res: Response) => {
    const { id } = req.query

    // console.log(userId);
    const { event_title, event_description, event_date, event_address } = req.body
    console.log(event_date)
    const user = await Users.findOne({ where: { id: req.user.id } })
    let [day, month, year] = event_date.split("-");
    day = Number(day) + 1;
    const formattedDate = new Date(`${year}-${month}-${(day)}`);


    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path.replace(/ /g, "_"))
        const event = await Events.findOne({ where: { id } })

        await event.update(
            {
                event_title: event_title ?? event?.event_title,
                event_description: event_description ?? event?.event_description,
                event_date: event_date ?? event?.event_date,
                formated_date: event_date == null ? event?.formated_date : formattedDate,
                event_address: event_address ?? event?.event_address,
                menu_picture: result.secure_url
            }
        );

        return res.status(200).send({ message: "Updated Successfully", event })
    } else {

        const event = await Events.findOne({ where: { id } })

        await event.update(
            {
                event_title: event_title ?? event?.event_title,
                event_description: event_description ?? event?.event_description,
                event_date: event_date ?? event?.event_date,
                formated_date: event_date == null ? event?.formated_date : formattedDate,
                event_address: event_address ?? event?.event_address,
            }
        );

        return res.status(200).send({ message: "Updated Successfully", event })
    }

}

// Menu




//Events



export const getEvent = async (req: Request, res: Response) => {
    const { id } = req.user
    const user = await Users.findOne({ where: { id } })
    console.log(user?.subscription_id)
    const events = await Events.findAll({ where: { userId: id } })
    return res.status(200).send({ message: "Fetched Successfully", events })
}






export const deleteEvent = async (req: Request, res: Response) => {
    const { id } = req.params
    const events = await Events.findOne({ where: { id } })
    await events?.destroy()
    return res.status(200).send({ message: "Deleted Successfully", events })
}




export const sendTestEmailCon = async (req: Request, res: Response) => {
    const send = await sendEmailResend("dailydevo9@gmail.com", "TEST", templateEmail("TEST", "dailydevo9@gmail.com".toString()))
    return res.status(200).send({ message: "Successfully", send })
}




export const createEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.user
        const { event_title, event_description, event_date, event_address } = req.body
        const user = await Users.findOne({ where: { id } })
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path.replace(/ /g, "_"))
            let [day, month, year] = event_date.split("-");
            day = Number(day) + 1;
            console.log(event_date)
            console.log(`${year}-${month}-${(day)}`)
            const formattedDate = new Date(`${year}-${month}-${(day)}`);

            const event = await Events.create(
                {
                    event_title,
                    event_description,
                    event_address,
                    event_date,
                    formated_date: formattedDate,
                    userId: user?.id,
                    menu_picture: result.secure_url
                }
            );
            return res.status(200).send({ message: "Created Successfully", event })
        } else {
            return res.status(400).send({ message: "Image is Required" })
        }
    } catch (e) {
        console.log(e);
        return res.status(400).send({ message: "Failed" })
    }
}