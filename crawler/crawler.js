import {cheerioParserBooksMetaData} from "./core/cheerioParser.js";
import {puppeteerParser} from "./core/puppeteerParser.js";
import secret from '../config/secret.js'
import got from "got";
import puppeteer from "puppeteer";


async function grabBooks(keyword){
    let books=null
    const metaInfoUrl=secret.booksMetaDataSource+keyword
    const downloadUrl=secret.booksDownloadSource
    const htmlSegment=await puppeteerParser(metaInfoUrl,'table')
    books=await cheerioParserBooksMetaData(htmlSegment)
    books=books.map(book=>{

    })
}

async function grabDownloadBooks(){
    // let query=title.replace(' ','+')
    const url=secret.booksDownloadSource
    // const {body}=await got(url+`search?q=${query}&more=true`)
    try {
        const browser=await puppeteer.launch({
            headless:false
        })
        const page=await browser.newPage()
        await page.goto(url)
        const searchElement=await page.$('#q')
        const submitElement=await page.$('#search-form button')
        const id=await page.evaluate((search)=>{
            return search.value='Java'
        },searchElement)
        const res=await Promise.all([
            page.waitForNavigation(),
            page.click('#search-form button')
        ])
        // await submitElement.click()
        console.log(res)
        const searchedBooks=await page.$$eval('.files-new .row',(lis)=>{
            console.log(lis)
            return lis.map(li=>{
                console.log(li)
                const title=li.querySelector('h2').innerText
                const coverUrl=li.querySelector('img').src
                const pages=li.querySelector('.fi-pagecount').innerText
                const published=li.querySelector('.fi-year').innerText
                const size=li.querySelector('.fi-size').innerText
                const book={
                    title,
                    coverUrl,
                    pages,
                    published,
                    size
                }
                return book

            })
        })
        console.log(searchedBooks)
    } catch (e) {
        console.log(e)
    }
}

export {
    grabDownloadBooks
}