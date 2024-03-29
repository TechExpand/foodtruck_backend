// @ts-nocheck comment

import { errorResponse, getDistanceFromLatLonInKm, successResponse } from "../helpers/utility";
import { Request, Response, query } from 'express';
import { LanLog } from "../models/LanLog";
import { Profile } from "../models/Profile";


import Stripe from 'stripe';
import { config } from "dotenv";
import { UserType, Users } from "../models/Users";
import { Menu } from "../models/Menus";
import { Events } from "../models/Event";
import { PopularVendor } from "../models/Popular";
import { Tag } from "../models/Tag";
import { HomeTag } from "../models/HomeTag";
import { Favourite } from "../models/Favourite";
import { Op } from "sequelize";
import { Order } from "../models/Order";
import { sendToken } from "../services/notification";
import { sendEmailResend } from "../services/sms";
import { templateEmail } from "../config/template";
const cloudinary = require("cloudinary").v2;
const stripe = new Stripe('sk_test_51HGpOPE84s4AdL4O3gsrsEu4BXpPqDpWvlRAwPA30reXQ6UKhOzlUluJaYKiDDh6g9A0xYJbeCh9rM0RnlQov2lW00ZyOHxrx1', {
    apiVersion: '2023-08-16',
});




export const getFavourite = async (req: Request, res: Response) => {
    const favourite = await Favourite.findAll({
        include: [
            { model: Profile, include: [{ model: LanLog }] },
            { model: Users },
        ]
    });
    return res.status(200).send({ message: "Fetched Successfully", favourite })
}



export const getOrder = async (req: Request, res: Response) => {
    const { id } = req.user;
    const order = await Order.findAll({
        where: { userId: id },
        include: [
            { model: Profile, include: [{ model: LanLog }] },
            { model: Users },
            { model: Menu },
        ]
    });
    return res.status(200).send({ message: "Fetched Successfully", order })
}



export const notifyOrder = async (req: Request, res: Response) => {
    const { status, orderid } = req.query;
  
    const order = await Order.findOne({
        where: { id: orderid },
        include: [
            { model: Profile },
            { model: Menu },
            { model: Users },]
    });
    if (!order) return res.status(200).send({ message: "Not Found", order })
    if (status == "PENDING") {
        await order.update({ status: "COMPLETED" })
        await sendToken(order.userId, `${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(),
            `pick up your meal at ${order.profile.dataValues.business_name}`
        );
        await sendEmailResend(`${order.user.dataValues.email}`,
            `${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(),
            templateEmail(`${order.user.dataValues.email}`, `pick up your meal at ${order.profile.dataValues.business_name}`)
        )
        return res.status(200).send({ message: "Fetched Successfully", order })
    } else {
        await sendToken(order.userId, `REMINDER: ${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(),
            `pick up your meal at ${order.profile.dataValues.business_name}`
        );
        await sendEmailResend(`${order.user.dataValues.email}`,
            `REMINDER: ${order.menu.dataValues.menu_title} IS READY FOR PICKUP`.toUpperCase(),
            templateEmail(`${order.user.dataValues.email}`, `pick up your meal at ${order.profile.dataValues.business_name}`)
        )
        return res.status(200).send({ message: "Fetched Successfully", order })
    }

}






export const postFavourite = async (req: Request, res: Response) => {
    let { profileId } = req.body;
    let { id } = req.user;
    const user = await Users.findOne({ where: { id } })
    const fav = await Favourite.findOne({where:{profileId, userId: id}})
    if(fav) return res.status(200).send({ message: "Vendor Added Successfully", status: true })
    const favourite = await Favourite.create({ profileId, userId: id })
    return res.status(200).send({ message: "Vendor Added Successfully", favourite, status: true })
}


export const postOrder = async (req: Request, res: Response) => {
    let { profileId, menuId, extras } = req.body;
    // let c = "[{id: 1, extra_price: 100, extra_title: 'testing good' }, {id: 2, extra_price: 100, extra_title: 'testing good' }]"
    let { id } = req.user;
    // const user = await Users.findOne({ where: { id } })
    // var objectStringArray = (new Function("return [" + extras+ "];")());
    // console.log(objectStringArray)
    const order = await Order.create({ profileId: profileId, userId: id, menuId, extras: extras })
    return res.status(200).send({ message: "Order Added Successfully", order, status: true })
}




export const getp = async (req: Request, res: Response) => {
    const profile = await Profile.findAll({})
    return res.status(200).send({ message: "Vendor Added Successfully", profile, status: true })
}



export const deleteFavourite = async (req: Request, res: Response) => {
    let { id } = req.body;
    const favourite = await Favourite.findOne({ where: { id } })
    await favourite?.destroy()
    return res.status(200).send({ message: "Deleted Successfully", status: true })
}




export const search = async (req: Request, res: Response) => {
    let { value } = req.query;
    // let {value} = req.query;
    value = value?.toString().replace("+", " ");

    let valueSearch: any = {}
    if (value && value != "") {
        valueSearch =
        {
            [Op.or]: [
                { 'business_name': { [Op.like]: '%' + value + '%' } },
                { 'tag': { [Op.like]: '%' + value + '%' } },
                { 'unique_detail': { [Op.like]: '%' + value + '%' } },
                { 'detail': { [Op.like]: '%' + value + '%' } },

            ]
        }
    }

    const vendor = await Profile.findAll({
        where: { ...valueSearch }, include: [
            { model: Users }, { model: LanLog }
        ]
    });

    successResponse(res, "Successful", vendor)
}