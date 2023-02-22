import express from 'express'
import pdfBooksSchema from "../../schema/book/pdfBooksSchema.js";
import {mongooseConnectDb} from '../../config/db.js'
import categoty from "../category/blogCategoty.js";
import {bookDowloadUploadStream} from '../../crawler/core/crawler.js'
import {client} from "../../oss/oss.js";


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

router.get('/:id',async (req,res)=>{
    try {
        const PdfBooks=await mongooseConnectDb(dbName,collection,pdfBooksSchema)
        const book=await  PdfBooks.findOne({id:req.params.id})
        let resBody=null
        if (book.uploaded){
            const url=client.signatureUrl('pdfBooks/'+book.fileName,{
                expires:1800 //30分钟
            })
            resBody={
                code:200,
                message:'授权下载',
                data: {
                    url
                }
            }
            await PdfBooks.updateOne({id:req.params.id},{downloads:++book.downloads})
        }else {
            resBody={
                code:404,
                message:'当前文件不存在'
            }
        }
        res.send(resBody)
    } catch (e) {
        const resBody={
            code:500,
            message:e.message
        }
        res.send(resBody)

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

router.post('/status/:id',async  (req,res)=>{
    try {
        const PdfBooks=await mongooseConnectDb(dbName,collection,pdfBooksSchema)
        const searchedBook=await PdfBooks.findOne({id:req.params.id})
        await PdfBooks.updateOne({id:req.params.id},{activeStatus:!searchedBook.activeStatus})
        res.send({
            code:200,
            message:'更新状态成功'
        })
    } catch (e) {
        res.send({
            code:500,
            message:e.message
        })
        console.log(e)
    }
})


router.delete('/:id',async (req,res)=>{
    try {
        const PdfBooks=await mongooseConnectDb(dbName,collection,pdfBooksSchema)
        const query={
            id:req.params.id
        }
        await PdfBooks.deleteOne(query)
        const resBody={
            code:200,
            message:'删除成功'
        }
        res.send(resBody)
    } catch (e) {
        const resBody={
            code:500,
            message:e.message
        }
        console.log(e)
        res.send(resBody)
    }
})

export default router