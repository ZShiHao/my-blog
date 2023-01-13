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

const app=express()
const port=3000

app.use(cors())
app.use('/blog',blog)
app.use('/books',bookRouter)
app.use('/category',category)
app.use('/tags',tags)
app.use('/book_category',bookCategory)






async function main(){
    // const res=grabHighRateBooksName('Java')
    console.time('下载时间')
    // const res=await got('https://www.pdfdrive.com/download.pdf?id=158299863&h=47173801a61a856470e6dcb5b91ad897&u=cache&ext=pdf')
    // await fs.writeFile('./text.pdf',res.rawBody)
    // console.log(res)
    try {
        const readStream=got.stream('https://www.pdfdrive.com/download.pdf?id=180663309&h=41191927a7d7b5d61399e368145a703b&u=cache&ext=pdf')
        console.log(readStream)
        const res=await client.putStream('test.pdf',readStream)
        readStream.on('downloadProgress',async res=>{
            console.log(res)
        })
        console.log(res)
        // console.log(res)
        // await fs.writeFile('./test.html',body)
        console.log('123')
    } catch (e) {
        console.log(e)
    }
    console.timeEnd('下载时间')
}
'https://www.pdfdrive.com/download.pdf?id=158299863&h=47173801a61a856470e6dcb5b91ad897&u=cache&ext=pdf'
main()


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})