"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatStripeTimestamp = exports.estimateCarCityTimeRange = exports.getDistanceFromLatLonInKm = exports.createRandomRef = exports.validateEmail = exports.randomId = exports.errorResponse = exports.successResponse = exports.handleResponse = void 0;
const luxon_1 = require("luxon");
const handleResponse = (res, statusCode, status, message, data) => {
    return res.status(statusCode).json({
        status,
        message,
        data,
    });
};
exports.handleResponse = handleResponse;
const successResponse = (res, message = 'Operation successfull', data) => {
    return res.status(200).json({
        status: true,
        message,
        data,
    });
};
exports.successResponse = successResponse;
const errorResponse = (res, message = 'An error occured', data) => {
    return res.status(400).json({
        status: false,
        message,
        data,
    });
};
exports.errorResponse = errorResponse;
const randomId = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
};
exports.randomId = randomId;
const validateEmail = (email) => {
    return email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};
exports.validateEmail = validateEmail;
const createRandomRef = (length, initial) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return `${initial}_${result}`;
};
exports.createRandomRef = createRandomRef;
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    var distance_miles = d * 0.621;
    return distance_miles;
};
exports.getDistanceFromLatLonInKm = getDistanceFromLatLonInKm;
const estimateCarCityTimeRange = (distanceKm) => {
    const bestCaseSpeed = 40; // Best-case speed in km/h
    const worstCaseSpeed = 20; // Worst-case speed in km/h (traffic)
    const bestTimeMinutes = (distanceKm / bestCaseSpeed) * 60;
    const worstTimeMinutes = (distanceKm / worstCaseSpeed) * 60;
    const minMinutes = Math.floor(bestTimeMinutes);
    const maxMinutes = Math.ceil(worstTimeMinutes);
    return `${minMinutes}-${maxMinutes} mins`;
};
exports.estimateCarCityTimeRange = estimateCarCityTimeRange;
function formatStripeTimestamp(unixTimestamp) {
    const date = luxon_1.DateTime.fromSeconds(unixTimestamp);
    const dayWithSuffix = `${date.day}${getDaySuffix(date.day)}`;
    const formatted = `${date.toFormat('cccc')} ${dayWithSuffix} ${date.toFormat('LLL, yyyy')}`;
    return formatted;
}
exports.formatStripeTimestamp = formatStripeTimestamp;
function getDaySuffix(day) {
    if (day >= 11 && day <= 13)
        return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}
//# sourceMappingURL=utility.js.map