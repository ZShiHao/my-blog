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

const dbName='share-books'
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
        res.send('删除成功')
    }catch(e){
        res.send(e.message)
    }
})

router.get('/',async (req,res)=>{
    try{
        const Books=await mongooseConnectDb(dbName,collection,bookSchema)
        const findRes=await Books.find({})
        await Promise.all(findRes.map(async (book)=>{
            try{
                const coverurl=await getImgURL('/imgs/books-cover/'+book.cover)
                book.cover=coverurl
            }catch(e){
                return book
            }
        }))
        res.send(findRes)
    }catch(e){
        res.send(e.message)
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
                    res.send('成功')
                }catch(e){
                    res.send(e.message)
                }
            })
        }else{
            res.send('没有收到上传的文件,请重新上传')
        }
    }catch(e){
        console.log(e)
        res.send(e.message)
    }
})

router.put('/status/:_id',bodyParser.json(),async (req,res)=>{
    try {
        const Books=await mongooseConnectDb(dbName,collection,bookSchema)
        const query={_id:new ObjectId(req.params._id)}
        await Books.updateOne(query,{activeStatus:req.body.activeStatus})
        res.send('激活状态更新')
    } catch (e) {
        res.send(e.message)
    }
})

router.get('/download/:_id',async (req,res)=>{
    try {
        const Books=await mongooseConnectDb(dbName,collection,bookSchema)
        const query={_id:new ObjectId(req.params._id)}
        const book=await Books.findOne(query)
        const downloadUrl=await getBookDownloadURL('/books/'+book.fileName)
        await Books.updateOne(query,{downloads:book.downloads+1})
        res.send(downloadUrl)
    } catch (e) {
        res.send(e.message)
    }
})

export default router