import puppeteer from "puppeteer";
import {cheerioParserBooksMetaData} from "./cheerioParser.js";
import secret from '../../config/secret.js'



async function puppeteerParser(url,selector){
    try {
        const browser=await puppeteer.launch({
            headless:true
        })
        const page=await browser.newPage()
        await page.goto(url)
        const rowHtml=await page.evaluate(()=>{
            return document.querySelector(selector).innerHTML
        })
        await browser.close();
        return rowHtml
    } catch (e) {
        console.log(e)
    }
}

export {
    puppeteerParser
}