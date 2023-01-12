import * as cheerio from "cheerio";


/**
 * 解析html代码段中的图书元信息(20本书一组)
 * @param htmlSegment {string}
 * @returns {Promise<*[]>}
 */
async function cheerioParserBooksMetaData(htmlSegment){
    try {
        const e=cheerio.load(htmlSegment,{
        },false)
        const rows=e('tr').toArray()
        const books=[]
        rows.forEach((trElement)=>{
            const book={
                title:'',
                author:'',
                published:''
            }
            const tds=trElement.children.filter((item)=>{
                if (item.type==='tag') return true
            })
            let index=0
            tds[1].children.forEach((element)=>{
                if (element.type==='tag'){
                    switch (index) {
                        case 0:
                            book.title=element.children[1].children[0].data
                            break
                        case 3:
                            let authorContainer=element
                            //深度遍历,到树的最深层
                            while (authorContainer.children!==undefined){
                                switch (authorContainer.children.length){
                                    case 3:
                                        authorContainer=authorContainer.children[1]
                                        break
                                    case 5: //goodreads author
                                        authorContainer=authorContainer.children[1]
                                        break
                                    default:
                                        authorContainer=authorContainer.children[0]
                                }
                            }
                            book.author=authorContainer.data
                            break
                        case 5:
                            book.published=element.children[1].children[2].data.match(/\d+/g)[0]
                            break
                        default:
                    }
                    index++
                }
            })
            books.push(book)
        })
        return books
    } catch (e) {
        console.log(e)
    }
}

export {
    cheerioParserBooksMetaData
}