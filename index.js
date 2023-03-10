import express from 'express'
import cors from 'cors'
import blog from './routes/blog/blog.js'
import bookRouter from "./routes/book/bookRouter.js";
import pdfBooksRouter from "./routes/book/pdfRouter.js";
import category from './routes/category/blogCategoty.js'
import tags from './routes/blog/tags.js'
import bookCategory from "./routes/category/bookCategory.js";
import userRouter from "./routes/user/userRouter.js";
import authorization from "./middleware/authorization.js";
import * as cheerio from 'cheerio'
import got from 'got'
import puppeteer from "puppeteer";
import fs from 'fs/promises'
import * as http from "http";
import {HttpsProxyAgent} from 'hpagent';
import {puppeteerParser} from "./crawler/core/puppeteerParser.js";
import {pipeline} from 'node:stream/promises'
import {client} from "./oss/oss.js";
import cliProgress from 'cli-progress'
import StreamSpeed from 'streamspeed'
import bytes from "bytes";
import secret from './config/secret.js'


import pdfBooksCrawler from "./crawler/index.js";
import {mongooseConnectDb} from "./config/db.js";
import pdfBooksSchema from "./schema/book/pdfBooksSchema.js";

const app=express()
const port=3000

app.use(cors())
app.use('/user',userRouter)
app.use(authorization) //鉴权中间件
app.use('/blog',blog)
app.use('/books',bookRouter)
app.use('/pdfbooks',pdfBooksRouter)
app.use('/category',category)
app.use('/tags',tags)
app.use('/book_category',bookCategory)


const dbName='share-books'
const collection='pdfbooks'




async function main(){
    try {
        console.time('下载时间')
        const res=await pdfBooksCrawler({name:'Design Patterns'})
        if (res){
            console.log(res)
        }
        console.timeEnd('下载时间')
    } catch (e) {
        console.log(e)
    }
}
async function test(){
    const PdfBooks=await mongooseConnectDb(dbName,collection,pdfBooksSchema)
    await PdfBooks.updateMany({},{
        activeStatus:true
    })

}
// main()
// test()

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})