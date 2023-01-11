import express from 'express'
import cors from 'cors'
import blog from './routes/blog/blog.js'
import bookRouter from "./routes/book/bookRouter.js";
import category from './routes/blog/categoty.js'
import tags from './routes/blog/tags.js'
import bookCategory from "./routes/book/bookCategory.js";
import * as cheerio from 'cheerio'
import got from 'got'
import {HttpsProxyAgent} from "hpagent";
import puppeteer from "puppeteer";
import {grabDownloadBooks} from './crawler/crawler.js'

const app=express()
const port=3000

app.use(cors())
app.use('/blog',blog)
app.use('/books',bookRouter)
app.use('/category',category)
app.use('/tags',tags)
app.use('/book_category',bookCategory)






async function main(){
    await grabDownloadBooks()
}


main()


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})