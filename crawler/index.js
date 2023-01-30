import {grabDownloadBooksInfo, grabBookDownloadUrl, grabHighRateBooksName} from './core/crawler.js'
import got from "got";
import StreamSpeed from "streamspeed";
import cliProgress from "cli-progress";
import bytes from "bytes";
import {client} from "../oss/oss.js";
import {mongooseConnectDb} from "../config/db.js";
import pdfBooksSchema from '../schema/book/pdfBooksSchema.js'

/**
 * TODO:核心流程
 *  1.根据关键词(分类)从booksMetaDataSource抓取每个关键词的高分书籍(主要是书名),每页20本,三页一共60本,books
 *  2.根据书名去booksDownloadSource查询,抓取查询结果图书的原信息(存到本地数据库),根据书名匹配到的关键词个数,只存前五本书
 *  3.用户查询某本书时,先去本地数据库查询,用户点击下载之后,取出该书的下载地址,去爬取这本书到服务器,再通过服务器返回给用户
 */

const dbName='share-books'
const collection='pdfBooks'
const schema=pdfBooksSchema
process.setMaxListeners(Infinity);

/**
 * download-upload stream
 * @param book {object}
 * @returns {Promise<boolean|*>} true:uploaded false:upload failed
 */
async function bookDowloadUploadStream(book){
    try {
        if (book.downloadUrl){
            const readStream=got.stream(book.downloadUrl,{
                timeout:{
                    request:30000
                }
            })
            let ss = new StreamSpeed();
            ss.add(readStream);
            let speed=''
            ss.on('speed', (s) => {
                speed=StreamSpeed.toHuman(s, { timeUnit: 's' });
            });
            const bar1=new cliProgress.SingleBar({
                format:'{bar} | {percentage}%  |{valueBytes}/{totalBytes} | Speed: {speed} | {filename}'
            }, cliProgress.Presets.shades_classic);
            readStream.on('response',async res=>{
                bar1.start(res.headers['content-length'],0,{
                    speed: "N/A"
                })
            })
            readStream.on('downloadProgress',async res=>{
                bar1.update(res.transferred,{
                    filename:book.title,
                    speed:speed,
                    valueBytes:bytes.format(res.transferred),
                    totalBytes:bytes.format(res.total)
                })
            })
            const res=await client.putStream(`./pdfBooks/${book.title}-${book.id}.pdf`,readStream)
            if (res.res.statusCode===200){
                console.log('成功上传oss')
                book.fileName=`${book.title}-${book.id}.pdf`
                bar1.stop();
                return book
            }else{
                bar1.stop();
                return false
            }
        }else {
            return false
        }
    } catch (e) {
        console.log(e)
        return e
    }
}

/**
 * crawler core procedure , grabbing books info
 * @param subCategory {object}
 * @returns {Promise<*>}
 */
async function pdfBooksCrawler(subCategory){
    try {
        const booksName=await grabHighRateBooksName(subCategory.name) //60
        console.log('booksname',booksName)
        const books=[] // 120
        let booksCount=0
        let proxyUrl = 'http://127.0.0.1:7890'

        for (let i=0;i<3;i++){
            let n=Math.floor(books.length/3)
            let endIndex=i===2?books.length:(i+1)*n
            booksCount++
            if(booksCount===20||i===0){ // 每次爬取同时抓取20本书 ,60本书分三次
                booksCount=0
                await Promise.all(booksName.slice(i,i+20).map(async (bookName,index)=>{
                    const  searchedBooks=await grabDownloadBooksInfo(bookName,subCategory.name)
                    searchedBooks.forEach(searchedBook=>{
                        books.push(searchedBook)
                    })
                }))
            }
        }

        // add downlaodUrl for every book in books
        // let fraction=7
        // const retryList=[]
        // for (let i=0;i<fraction;i++){
        //     // 减少抓取频率
        //     let n=Math.floor(books.length/fraction)
        //     let endIndex=i===fraction-1?books.length:(i+1)*n
        //     const body={code:1}
        //     await Promise.all(books.slice(i*n,endIndex).map(async (book,index)=>{
        //         const downloadUrl=await grabBookDownloadUrl(book,i*n+index,body.code!==0?'http://127.0.0.1:7890':`http://${body.data['proxy_list'][0]}`)
        //         if(typeof downloadUrl === 'number'){
        //             retryList.push(downloadUrl)
        //         }else {
        //             book.downloadUrl=downloadUrl?downloadUrl:''
        //         }
        //     }))
        // }
        // // 抓取失败的图书,重新抓取
        // await Promise.all(retryList.map(async (i)=>{
        //     const res=await got('https://dps.kdlapi.com/api/getdps/?secret_id=odguag6up032vkdprhxb&num=1&signature=o62sb2wv4lh8jxwtzeoiyyimd0&pt=1&format=json&sep=1')
        //     const body=JSON.parse(res.body)
        //     const downloadUrl=await grabBookDownloadUrl(books[i],i,body.code!==0?'http://127.0.0.1:7890':`http://${body.data['proxy_list'][0]}`)
        //     books[i].downloadUrl=downloadUrl?downloadUrl:''
        // }))
        //
        // const PdfBooks=await mongooseConnectDb(dbName,collection,pdfBooksSchema)
        // const re=await PdfBooks.create(books)
        // console.log(re)
        console.log('books',books)

        // await Promise.all(books.map(async book=>{
        //     const searchedBook=await PdfBooks.findOne({id:book.id})
        //     // 首先查询数据库看是否已经添加过这本书
        //     if (!searchedBook.title){
        //         const uploadedBook=await bookDowloadUploadStream(book)
        //         if (uploadedBook){
        //             // 添加到数据库中
        //             uploadedBook.createDate=new Date()
        //             uploadedBook.activeStatus=true
        //             uploadedBook.format='pdf'
        //             await PdfBooks.create(uploadedBook)
        //         }
        //     }
        // }))
        return true
    } catch (e) {
        console.log(e)
        return e
    }
}


export default pdfBooksCrawler