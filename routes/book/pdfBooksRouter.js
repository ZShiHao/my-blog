import express from 'express'
import pdfBooksSchema from "../../schema/book/pdfBooksSchema.js";
import {mongooseConnectDb} from '../../config/db.js'
import categoty from "../blog/categoty.js";
import {bookDowloadUploadStream} from '../../crawler/core/crawler.js'



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


router.put('/upload/:id',async (req,res)=>{
    try {
        const PdfBooks=await mongooseConnectDb(dbName,collection,pdfBooksSchema)
        const searchedBook=await PdfBooks.findOne({id:req.params.id})
        console.log('开始上传')
        const ifUploaded=await bookDowloadUploadStream(searchedBook)
        if (ifUploaded){
            await PdfBooks.updateOne({id:req.params.id},{uploaded:true})
            const resBody={
                code:200,
                message: '上传成功了'
            }
            console.log('上传成功了')
            res.send(resBody)
        }else{
            const resBody={
                code:500,
                message:'上传失败'
            }
            res.send(resBody)
        }
    } catch (e) {
        const resBody={
            code:500,
            message:e.message
        }
        res.send(resBody)
    }
})

export default router