
// import { NextFunction, Request, Response } from 'express';
// import config from '../config/configSetup';
const cloudinary = require('cloudinary').v2
import multer from "multer";
const  fs = require('fs')
const  path = require('path')



// cloudinary configuration
cloudinary.config({
    cloud_name: 'dqth56myg',
    api_key: '774921177923962',
    api_secret: 'dDUKTJBycDHC4gjOKZ9UAHw8SAM'
  });
  
  

 
  const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './image')
    },
    filename: (req, file, cb) => {
      let filename = Date.now() + "--" + file.originalname;
      cb(null, filename.replace(/\s+/g, ''))
    }
  });




export const uploads = multer({
    storage: imageStorage,
  })



export const upload_cloud = async (path: string)=>{
	const result = await cloudinary.uploader.upload(path,  { resource_type: 'auto' })
	return result;
  }
