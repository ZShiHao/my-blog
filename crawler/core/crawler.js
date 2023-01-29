import {cheerioParserBooksMetaData} from "./cheerioParser.js";
import {puppeteerParser} from "./puppeteerParser.js";
import secret from '../../config/secret.js'
import got from "got";
import puppeteer from "puppeteer";
import queryString from 'query-string'
import * as cheerio from "cheerio";
import {HttpProxyAgent, HttpsProxyAgent} from "hpagent";
import fs from 'fs/promises'




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
 * @param subCategory {string} 书的分类
 * @returns {Promise<[{}]>} 两本最匹配的pdf元信息
 */
async function grabDownloadBooksInfo(title,subCategory){
    try {
        title=title.replaceAll(' ','+')
        const query={
            q:title,
            em:1,
            searchin:'en'
        }
        const searchUrl=secret.booksDownloadSource+'search?'+queryString.stringify(query)
        const browser=await puppeteer.launch({
            headless:true
        })
        //打开搜索页面
        const page=await browser.newPage()
        await page.goto(searchUrl,{
            timeout:120000
        })
        //提取搜索的图书信息
        let searchedBooks=await page.$$eval('.files-new .row',(lis)=>{
            const books=[]
            if(lis.length!==0){
                let endIndex=lis.length<=1?1:2
                for (let i=0;i<endIndex;i++){
                    // 只去返回结果的前本书
                    const li=lis[i]
                    const title=li.querySelector('h2')?.innerText
                    const coverUrl=li.querySelector('img')?.src
                    const pages=li.querySelector('.fi-pagecount')?.innerText
                    const published=li.querySelector('.fi-year')?.innerText
                    const size=li.querySelector('.fi-size')?.innerText
                    const download=li.querySelector('.fi-hit')?.innerText
                    const id=li.querySelector('a')?.dataset.id
                    const detailPage=li.querySelector('a')?.href
                    const downloadPage=li.querySelector('a')?.href.replace('e'+id,'d'+id)
                    const book={
                        title,
                        coverUrl,
                        pages,
                        published,
                        size,
                        id,
                        downloadPage,
                        detailPage,
                        language:'English'
                    }
                    books.push(book)
                }
            }
            return books
        })
        await browser.close()

        //给搜索的图书结果添加作者信息

        searchedBooks=await Promise.all(searchedBooks.map(async (book)=>{
            const title=book.title.replaceAll(' ','-')
            const url=book.detailPage
            const {body} =await got(url,{
                agent:{
                    https:new HttpsProxyAgent({
                        proxy:'http://127.0.0.1:7890'
                    })
                }
            })
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
            book.category=subCategory
            return book
        }))
        return searchedBooks
    } catch (e) {
        console.log(e)
        return e
    }
}

async function grabPDFSession(url){
    try {
        const {body}=await got(url,{
            agent:{
                https:new HttpsProxyAgent({
                    proxy:'http://127.0.0.1:7890'
                })
            }
        })
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
 * get book's download url , if this book available
 * @param book {Object}
 * @returns {Promise}
 */
async function grabBookDownloadUrl(book){
    try {
        const sessionID=await grabPDFSession(book.downloadPage)
        const {body} =await got(secret.booksDownloadSource+'ebook/broken/?'+queryString.stringify({
            id:book.id,
            session:sessionID
        }),{
            agent:{
                https:new HttpsProxyAgent({
                    proxy:'http://127.0.0.1:7890'
                })
            }
        })
        // if body html segment has 'Aid' ,meaning this book can be downloaded.
        if(body.indexOf('AiD')){
            const query={
                id:book.id,
                h:sessionID,
                u:'cache',
                ext:'pdf'
            }
            const downloadUrl=secret.booksDownloadSource+'/download.pdf?'+queryString.stringify(query)
            return downloadUrl
        }else{
            return false // -1 means this book can't be downloaded
        }
    } catch (e) {
        console.log(e)
        return e
    }
}

export {
    grabDownloadBooksInfo,
    grabBookDownloadUrl,
    grabHighRateBooksName
}