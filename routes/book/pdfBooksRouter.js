import express from 'express'
import pdfBooksSchema from "../../schema/book/pdfBooksSchema.js";
import {mongooseConnectDb} from '../../config/db.js'
import categoty from "../blog/categoty.js";


const router=express.Router()

const dbName='share-books'
const collection='pdfbooks'



router.get('/',async (req,res)=>{
    try {
        const PdfBooks=await mongooseConnectDb(dbName,collection,pdfBooksSchema)
        const query=req.query.category?{
            category:req.query.category
        }:{}
        const paginationOptions={
            page:req.query.page,
            limit:20,
        }
        const findRes=await PdfBooks.paginate(query,paginationOptions)
        const resBody={
            code:200,
            message:'成功了',
            data:{
                page: req.params.page,
                totalPages:findRes.totalPages,
                totalCount:findRes.totalDocs,
                books:findRes.docs
            },
        }
        res.send(resBody)
    } catch (e) {
        res.send(e.message)
    }
})

export default router