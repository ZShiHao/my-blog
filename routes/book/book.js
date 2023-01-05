import express from 'express'
import multer from 'multer'
import gm from 'gm'
import fs from 'node:fs/promises'
import {PDFDocument} from "pdf-lib";
import bodyParser from 'body-parser'
import {mongooseConnectDb} from '../../config/db.js'
import {uploadBook,uploadBookCover} from '../../config/oss.js'
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

router.get('/',async (req,res)=>{

})

router.post('/',upload.any(),async (req,res)=>{
    try{
        if (req.files.length!==0){
            const file=req.files[0]
            const uploadResult=await uploadBook(file)
            const pdfDoc=await PDFDocument.load(file.buffer)
            if (!pdfDoc.getTitle()){
                const name=file.originalname
                pdfDoc.setTitle(name.slice(0,name.length-4))
                await pdfDoc.save()
            }
            const title=pdfDoc.getTitle()
            im(file.buffer,'pdf[0]').toBuffer('PNG',async function (err, buffer) {
                if (err) return err;
                const coverName=title+'.png'
                await uploadBookCover(coverName,buffer)
                const Books=await mongooseConnectDb(dbName,collection,bookSchema)
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
                    downloads:0
                }
                await Books.create(book)
                res.send('成功')
            })
        }else{
            res.send('没有收到上传的文件,请重新上传')
        }
    }catch(e){
        console.log(e)
        res.send(e.message)
    }
})

export default router