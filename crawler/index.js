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

/**
 * download-upload stream
 * @param book {object}
 * @returns {Promise<boolean|*>} true:uploaded false:upload failed
 */
async function bookDowloadUploadStream(book){
    try {
        if (book.downloadUrl){
            const readStream=got.stream(book.downloadUrl)
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
 * @param subCategory {string}
 * @returns {Promise<*>}
 */
async function pdfBooksCrawler(subCategory){
    try {
        const booksName=await grabHighRateBooksName(subCategory.name) //60
        const books=[]
        await Promise.all(booksName.map(async (bookName)=>{
            const  searchedBooks=await grabDownloadBooksInfo(bookName,subCategory.name)
            searchedBooks.forEach(searchedBook=>{
                books.push(searchedBook)
            })
        }))
        // add downlaodUrl for every book in books
        await Promise.all(books.map(async book=>{
            const downloadUrl=await grabBookDownloadUrl(book)
            downloadUrl?book.downloadUrl='':book.downloadUrl=downloadUrl
        }))
        const PdfBooks=await mongooseConnectDb(dbName,collection,pdfBooksSchema)
        await Promise.all(books.map(async book=>{
            const searchedBook=PdfBooks.findOne({id:book.id})
            // 首先查询数据库看是否已经添加过这本书
            if (!searchedBook.title){
                const uploadedBook=await bookDowloadUploadStream(book)
                if (uploadedBook){
                    // 添加到数据库中
                    uploadedBook.createDate=new Date()
                    uploadedBook.activeStatus=true
                    uploadedBook.format='pdf'
                    await PdfBooks.create(uploadedBook)
                }
            }
        }))
        return true
    } catch (e) {
        console.log(e)
        return e
    }
}
