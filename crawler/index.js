import {grabDownloadBooks, grabPDF, grabHighRateBooksName} from './core/crawler.js'

/**
 * TODO:核心流程
 *  1.根据关键词(分类)从booksMetaDataSource抓取每个关键词的高分书籍(主要是书名),每页20本,三页一共60本,books
 *  2.根据书名去booksDownloadSource查询,抓取查询结果图书的原信息(存到本地数据库),根据书名匹配到的关键词个数,只存前五本书
 *  3.用户查询某本书时,先去本地数据库查询,用户点击下载之后,取出该书的下载地址,去爬取这本书到服务器,再通过服务器返回给用户
 */

async function pdfBooksCrawler(subCategory){
    try {
        const booksName=await grabHighRateBooksName(subCategory.name)
        const books=[]
        await Promise.all(booksName.map(async (bookName)=>{
            const  searchedBooks=await grabDownloadBooks(bookName)
            searchedBooks.forEach(searchedBook=>{
                books.push(searchedBook)
            })
        }))
        await Promise.all(booksName.map(async book=>{

        }))

    } catch (e) {
        console.log(e)
        return e
    }
}
