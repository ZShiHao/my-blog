import express from 'express'
import cors from 'cors'
import blog from './routes/blog/blog.js'
import bookRouter from "./routes/book/bookRouter.js";
import pdfBooksRouter from "./routes/book/pdfBooksRouter.js";
import category from './routes/blog/categoty.js'
import tags from './routes/blog/tags.js'
import bookCategory from "./routes/book/bookCategory.js";
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

const app=express()
const port=3000

app.use(cors())
app.use('/blog',blog)
app.use('/books',bookRouter)
app.use('/pdfbooks',pdfBooksRouter)
app.use('/category',category)
app.use('/tags',tags)
app.use('/book_category',bookCategory)






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

}
main()
// test()

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})