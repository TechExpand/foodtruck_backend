"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload_cloud = exports.uploads = void 0;
// import { NextFunction, Request, Response } from 'express';
// import config from '../config/configSetup';
const cloudinary = require('cloudinary').v2;
const multer_1 = __importDefault(require("multer"));
const fs = require('fs');
const path = require('path');
// cloudinary configuration
cloudinary.config({
    cloud_name: 'dqth56myg',
    api_key: '774921177923962',
    api_secret: 'dDUKTJBycDHC4gjOKZ9UAHw8SAM'
});
const imageStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './image');
    },
    filename: (req, file, cb) => {
        let filename = Date.now() + "--" + file.originalname;
        cb(null, filename.replace(/\s+/g, ''));
    }
});
exports.uploads = (0, multer_1.default)({
    storage: imageStorage,
});
const upload_cloud = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield cloudinary.uploader.upload(path, { resource_type: 'auto' });
    return result;
});
exports.upload_cloud = upload_cloud;
//# sourceMappingURL=upload.js.map