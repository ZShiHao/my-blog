import {grabDownloadBooksInfo, grabBookDownloadUrl, grabHighRateBooksName} from './core/crawler.js'
import got from "got";
import StreamSpeed from "streamspeed";
import cliProgress from "cli-progress";
import bytes from "bytes";
import {client} from "../oss/oss.js";
import {mongooseConnectDb} from "../config/db.js";
import pdfBooksSchema from '../schema/book/pdfBooksSchema.js'
import secret from '../config/secret.js'

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

        let bookNamesFraction=7
        for (let i=0;i<bookNamesFraction;i++){
            let n=Math.floor(booksName.length/bookNamesFraction)
            let endIndex=i===bookNamesFraction-1?booksName.length:(i+1)*n
            await Promise.all(booksName.slice(i*n,endIndex).map(async (bookName,index)=>{
                const  searchedBooks=await grabDownloadBooksInfo(bookName,subCategory.name)
                searchedBooks.forEach(searchedBook=>{
                    books.push(searchedBook)
                })
            }))
        }

        // add downlaodUrl for every book in books
        let fraction=7
        const retryList=[]
        for (let i=0;i<fraction;i++){
            // 减少抓取频率
            let n=Math.floor(books.length/fraction)
            let endIndex=i===fraction-1?books.length:(i+1)*n
            const body={code:1}
            await Promise.all(books.slice(i*n,endIndex).map(async (book,index)=>{
                const downloadUrl=await grabBookDownloadUrl(book,i*n+index,body.code!==0?'http://127.0.0.1:7890':`http://${body.data['proxy_list'][0]}`)
                if(typeof downloadUrl === 'number'){
                    retryList.push(downloadUrl)
                }else {
                    book.downloadUrl=downloadUrl?downloadUrl:''
                }
            }))
        }

        console.log('retryList',retryList)

        let retryFraction=Math.ceil(retryList.length/10)
        for (let i=0;i<retryFraction;i++){
            // 减少抓取频率
            let n=Math.floor(retryList.length/retryFraction)
            let endIndex=i===retryFraction-1?retryList.length:(i+1)*n
            const {body}=await got.post('https://auth.kdlapi.com/api/get_secret_token',{
                form:{
                    'secret_id':secret.secretId,
                    'secret_key':secret.secretKey
                }
            })
            const res=await got(`https://dps.kdlapi.com/api/getdps/?secret_id=${secret.secretId}&num=1&signature=${JSON.parse(body).data['secret_token']}&pt=1&format=json&sep=1`)
            console.log(JSON.parse(res.body).data['proxy_list'][0])
            await Promise.all(retryList.slice(i*n,endIndex).map(async (i,index)=>{
                const downloadUrl=await grabBookDownloadUrl(books[i],i*n+index,`http://${JSON.parse(res.body).data['proxy_list'][0]}`)
                books[i].downloadUrl=downloadUrl?downloadUrl:''
            }))
        }


        console.log('books',books)

        //数组去重,去掉重复的图书,避免数据库插入数据时报错
        let map=new Map()
        let dedupBooks=[]
        books.forEach(book=>{
            if(map.get(book.id)){

            }else{
                dedupBooks.push(book)
                map.set(book.id,true)
            }
        })
        console.log('dedupBooks',dedupBooks)
        const PdfBooks=await mongooseConnectDb(dbName,collection,pdfBooksSchema)
        const re=await PdfBooks.insertMany(dedupBooks,{
            ordered:false
        })
        console.log(re)

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