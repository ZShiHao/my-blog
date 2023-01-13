import {cheerioParserBooksMetaData} from "./cheerioParser.js";
import {puppeteerParser} from "./puppeteerParser.js";
import secret from '../../config/secret.js'
import got from "got";
import puppeteer from "puppeteer";
import queryString from 'query-string'
import * as cheerio from "cheerio";
import {HttpProxyAgent, HttpsProxyAgent} from "hpagent";


/**
 * TODO:核心流程
 *  1.根据关键词(分类)从booksMetaDataSource抓取每个关键词的高分书籍(主要是书名),每页20本,三页一共60本,books
 *  2.根据书名去booksDownloadSource查询,抓取查询结果图书的原信息(存到本地数据库),根据书名匹配到的关键词个数,只存前五本书
 *  3.用户查询某本书时,先去本地数据库查询,用户点击下载之后,取出该书的下载地址,去爬取这本书到服务器,再通过服务器返回给用户
 */


/**
 * 根据关键词(分类)收集书名
 * @param keyword {string}搜索关键词(分类)
 * @returns {Promise<[String]>} 60本书的书名
 */
async function grabHighRateBooksName(keyword){
    try {
        let booksTitles=[]
        for (let i=0;i<=2;i++){
            const query={
                q:keyword,
                page:i+1,
                tab:'book'
            }
            const url=secret.booksMetaDataSource+'search?'+queryString.stringify(query)
            const {body}=await got(url,{
                agent:{
                    https:new HttpsProxyAgent({
                        proxy:'http://127.0.0.1:7890'
                    })
                }
            })
            const document=cheerio.load(body)
            const titleDoms=document('.bookTitle span').toArray()
            console.log(titleDoms)
            titleDoms.forEach(titleDom=>{
                booksTitles.push(titleDom.children[0].data)
            })
        }
        return booksTitles
    } catch (e) {
        console.log(e)
    }
}

/**
 * 抓取该本书的可下载的pdf
 * @param title {string} 书名
 * @returns {Promise<[{}]>} 两本最匹配的pdf元信息
 */
async function grabDownloadBooks(title){
    try {
        title=title.replaceAll(' ','+')
        const query={
            q:title,
            em:1,
            searchin:'en'
        }
        const searchUrl=secret.booksDownloadSource+'search?'+queryString.stringify(query)
        const browser=await puppeteer.launch({
            headless:false
        })
        //打开搜索页面
        const page=await browser.newPage()
        await page.goto(searchUrl,{
            timeout:60000
        })
        //提取搜索的图书信息
        let searchedBooks=await page.$$eval('.files-new .row',(lis)=>{
            const books=[]
            for (let i=0;i<2;i++){
                // 只去返回结果的前本书
                const li=lis[i]
                const title=li.querySelector('h2')?.innerText
                const coverUrl=li.querySelector('img')?.src
                const pages=li.querySelector('.fi-pagecount')?.innerText
                const published=li.querySelector('.fi-year')?.innerText
                const size=li.querySelector('.fi-size')?.innerText
                const id=li.querySelector('a')?.dataset.id
                const downloadPage=li.querySelector('a')?.href.replace('e'+id,'d'+id)
                const book={
                    title,
                    coverUrl,
                    pages,
                    published,
                    size,
                    id,
                    downloadPage,
                    language:'English'
                }
                books.push(book)
            }
            return books
        })
        searchedBooks=await Promise.all(searchedBooks.map(async (book)=>{
            const title=book.title.replaceAll(' ','-')
            const url=secret.booksDownloadSource+title+`-e${book.id}.html`
            console.log(url)
            const {body} =await got(url)
            let author=''
            let flag=false
            for (let i=body.search('creator');body[i]!=='<';i++){
                if(flag){
                    author=author+body[i]
                }
                if(body[i]==='>'){
                    flag=true
                }
            }
            book.author=author
            return book
        }))
        return searchedBooks
    } catch (e) {
        console.log(e)
    }
}

async function grabPDFSession(url){
    try {
        const {body}=await got(url)
        let n=0
        let sessionID=''
        for (let i=body.indexOf('session');n<2;i++){
            if(n===1&&body[i]!=='\''){
                sessionID=sessionID+body[i]
            }
            if (body[i]==='\''){
                n++
            }
        }
        return sessionID
    } catch (e) {
        console.log(e)
    }
}

/**
 *
 * @param book {Object}
 * @returns {Promise<{body: string, rawBody: } & {requestUrl: URL, redirectUrls: URL[], request: Request, ip?: string, isFromCache: boolean, statusCode: number, url: string, timings: Timings, retryCount: number, rawBody?: , body?: unknown, ok: boolean} & IncomingMessageWithTimings>}
 */
async function grabPDF(book){
    try {
        console.time('共花费了')
        const sessionID=await grabPDFSession(book.downloadPage)
        const query={
            id:book.id,
            h:sessionID,
            u:'cache',
            ext:'pdf'
        }
        const res=await got(secret.booksDownloadSource+'/download.pdf?'+queryString.stringify(query),{
            agent:{
                http:new HttpProxyAgent({
                    proxy:'http://109.254.37.40:9090'
                })
            }
        })
        return res
        console.timeEnd('共花费了')
    } catch (e) {
        console.log(e)
    }
}

export {
    grabDownloadBooks,
    grabPDF,
    grabHighRateBooksName
}