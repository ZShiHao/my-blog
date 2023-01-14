import express from 'express'
import cors from 'cors'
import blog from './routes/blog/blog.js'
import bookRouter from "./routes/book/bookRouter.js";
import category from './routes/blog/categoty.js'
import tags from './routes/blog/tags.js'
import bookCategory from "./routes/book/bookCategory.js";
import * as cheerio from 'cheerio'
import got from 'got'
import puppeteer from "puppeteer";
import {grabDownloadBooks,grabPDF,grabHighRateBooksName} from './crawler/core/crawler.js'
import fs from 'fs/promises'
import * as http from "http";
import {HttpsProxyAgent} from 'hpagent';
import {puppeteerParser} from "./crawler/core/puppeteerParser.js";
import {pipeline} from 'node:stream/promises'
import {client} from "./oss/oss.js";
import cliProgress from 'cli-progress'

const app=express()
const port=3000

app.use(cors())
app.use('/blog',blog)
app.use('/books',bookRouter)
app.use('/category',category)
app.use('/tags',tags)
app.use('/book_category',bookCategory)






async function main(){
    console.time('下载时间')
    try {
        const readStream=got.stream('https://www.pdfdrive.com/download.pdf?id=180663309&h=41191927a7d7b5d61399e368145a703b&u=cache&ext=pdf')
        const bar1=new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        readStream.on('response',async res=>{
            bar1.start(res.headers['content-length'],0)
        })
        readStream.on('downloadProgress',async res=>{
            bar1.update(res.transferred)
        })
        const res=await client.putStream('test.pdf',readStream)
        console.log('123')
    } catch (e) {
        console.log(e)
    }
    console.timeEnd('下载时间')
}
main()

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})