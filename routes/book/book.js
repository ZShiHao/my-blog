import express from 'express'
import multer from 'multer'
import bodyParser from 'body-parser'
import {mongooseConnectDb} from '../../config/db.js'
import {getCoverImgURL,list,uploadBlogBuffer,uploadCoverBuffer,getImgURL} from '../../config/oss.js'
import { ObjectId} from  "mongodb"
import Books from "../../schema/book/bookSchema.js";
import moment from  'moment'

const router=express.Router()

const dbName='share-books'
