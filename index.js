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

const app=express()
const port=3000

app.use(cors())
app.use('/blog',blog)
app.use('/books',bookRouter)
app.use('/category',category)
app.use('/tags',tags)
app.use('/book_category',bookCategory)






async function main(){
    console.time('cheerio')
    const res=await grabHighRateBooksName('JavaScript')

    // const {body}=await got('https://www.goodreads.com/search?page=1&q=JavaScript&tab=books',{
    //     agent:{
    //         https:new HttpsProxyAgent({
    //             proxy:'http://127.0.0.1:7890'
    //         })
    //     }
    // })
    // const e=cheerio.load(body)
    // e('.book')
    console.timeEnd('cheerio')
    // const books=await grabDownloadBooks('The Principles of Object-Oriented JavaScript')
    // console.log(books)
    // const book={
    //     downloadPage:'https://www.pdfdrive.com/introduction-to-java-programming-comprehensive-version-d169560000.html',
    //     id:'169560000'
    // }
    // await grabPDF(book)

    // const {body}=await got('https://www.pdfdrive.com/thinking-in-java-e158656226.html')
    // await fs.writeFile('./test.html',body)
    console.log('123')
}


// main()


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})