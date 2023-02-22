import express from 'express'
import multer from 'multer'
import gm from 'gm'
import fs from 'node:fs/promises'
import {PDFDocument} from "pdf-lib";
import bodyParser from 'body-parser'
import {mongooseConnectDb} from '../../config/db.js'
import {uploadBook,uploadBookCover,getImgURL,deleteBook,getBookDownloadURL} from '../../oss/booksOss.js'
import { ObjectId} from  "mongodb"
import bookSchema from "../../schema/book/bookSchema.js";
import bytes from 'bytes'
import moment from  'moment'

const router=express.Router()

const dbName='my-books'
const collection='books'

const upload=multer({
    fileFilter(req,file,callback){
        file.originalname=Buffer.from(file.originalname,'latin1').toString('utf8')
        callback(null,true);
    },
})
const im=gm.subClass({ imageMagick: '7+' })

router.delete('/:_id',async (req,res)=>{
    try{
        const Books=await mongooseConnectDb(dbName,collection,bookSchema)
        const query={_id:new ObjectId(req.params._id)}
        const book=await Books.findOne(query)
        await deleteBook(book.fileName)
        await Books.deleteOne(query)
        const resBody={
            code:200,
            message:'删除成功'
        }
        res.send(resBody)
    }catch(e){
        const resBody={
            code:500,
            message:e.message
        }
        res.send(resBody)
    }
})

router.get('/book/:_id',async (req,res)=>{
    try {
        const Books=await mongooseConnectDb(dbName,collection,bookSchema)
        const book=await Books.findOne({_id:req.params._id})
        const resBody={
            code:200,
            message:'删除成功',
            data:book
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

// 查询图书
router.get('/',bodyParser.json(),async (req,res)=>{
    try{
        const urlQuery=req.query
        const Books=await mongooseConnectDb(dbName,collection,bookSchema)
        let query={}
        if(Object.keys(urlQuery).length!==0){
            for(let key in urlQuery){
                switch (key) {
                    case 'title': //title支持模糊查询
                        query[key]={
                            $regex:new RegExp(urlQuery[key]),
                            $options:'i'
                        };
                        break;
                    default:
                        query[key]=urlQuery[key];
                        break;
                }
            }
        }
        const findRes=await Books.find(query)
        await Promise.all(findRes.map(async (book)=>{
            try{
                const coverurl=await getImgURL('/imgs/books-cover/'+book.cover)
                book.cover=coverurl
            }catch(e){
                return book
            }
        }))
        const resBody={
            code:200,
            message:'删除成功',
            data:findRes
        }
        res.send(resBody)
    }catch(e){
        const resBody={
            code:500,
            message:e.message
        }
        res.send(resBody)
    }
})

router.post('/',upload.any(),async (req,res)=>{
    try{
        if (req.files.length!==0){
            const Books=await mongooseConnectDb(dbName,collection,bookSchema)
            const file=req.files[0]
            const ifHas=await Books.findOne({title:file.originalname.slice(0,file.originalname.length-4)})
            if (ifHas?.title){
                res.send('已经添加过这本书了')
            }
            const uploadResult=await uploadBook(file)
            const pdfDoc=await PDFDocument.load(file.buffer,{parseSpeed:Infinity})
            if (!pdfDoc.getTitle()){
                const name=file.originalname
                pdfDoc.setTitle(name.slice(0,name.length-4))
                await pdfDoc.save()
            }
            const title=pdfDoc.getTitle()
            im(file.buffer,'pdf[0]').toBuffer('PNG',async function (err, buffer) {
                try{
                    if (err) return err;
                    const coverName=title+'.png'
                    await uploadBookCover(coverName,buffer)
                    const book={
                        title,
                        createDate:pdfDoc.getCreationDate(),
                        cover:coverName,
                        category:req.body.category,
                        activeStatus:true,
                        author:pdfDoc.getAuthor()?pdfDoc.getAuthor():'',
                        language:Number(req.body.language),
                        format:'PDF',
                        size:bytes(file.size),
                        pages:pdfDoc.getPageCount(),
                        downloads:0,
                        fileName:file.originalname
                    }
                    await Books.create(book)
                    const resBody={
                        code:200,
                        message:'成功',
                    }
                    res.send(resBody)
                }catch(e){
                    const resBody={
                        code:500,
                        message:e.message
                    }
                    res.send(resBody)
                }
            })
        }else{
            const resBody={
                code:500,
                message:'没有收到上传的文件,请重新上传'
            }
            res.send(resBody)
        }
    }catch(e){
        const resBody={
            code:500,
            message:e.message
        }
        res.send(resBody)
    }
})

router.put('/status/:_id',bodyParser.json(),async (req,res)=>{
    try {
        const Books=await mongooseConnectDb(dbName,collection,bookSchema)
        const query={_id:new ObjectId(req.params._id)}
        await Books.updateOne(query,{activeStatus:req.body.activeStatus})
        const resBody={
            code:200,
            message:'激活状态已更新'
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

router.put('/setting/:_id',bodyParser.json(),async (req,res)=>{
    try {
        const Books=await mongooseConnectDb(dbName,collection,bookSchema)
        const query={_id:new ObjectId(req.params._id)}
        console.log(req.body)
        await Books.updateOne(query,req.body)
        const book=await Books.findOne(query)
        const coverurl=await getImgURL('/imgs/books-cover/'+book.cover)
        book.cover=coverurl
        const resBody={
            code:200,
            message:'成功',
            data:book
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

router.get('/download/:_id',async (req,res)=>{
    try {
        const Books=await mongooseConnectDb(dbName,collection,bookSchema)
        const query={_id:new ObjectId(req.params._id)}
        const book=await Books.findOne(query)
        const downloadUrl=await getBookDownloadURL('/books/'+book.fileName)
        await Books.updateOne(query,{downloads:book.downloads+1})
        const resBody={
            code:200,
            message:'成功',
            data:downloadUrl
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

export default router