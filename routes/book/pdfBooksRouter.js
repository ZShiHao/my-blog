import express from 'express'
import pdfBooksSchema from "../../schema/book/pdfBooksSchema.js";
import {mongooseConnectDb} from '../../config/db.js'


const router=express.Router()

const dbName='share-books'
const collection='pdfbooks'

router.get('/',async (req,res)=>{
    try {
        const PdfBooks=await mongooseConnectDb(dbName,collection,pdfBooksSchema)
        const findRes=await PdfBooks.find({})
        res.send(findRes)
    } catch (e) {
        res.send(e.message)
    }
})

export default router