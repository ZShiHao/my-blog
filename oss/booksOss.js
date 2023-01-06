import client from "../config/oss.js";

const bookPath='/books/'

async function uploadBook(file){
    try{
        const result=await client.put(bookPath+file.originalname,file.buffer)
        return result
    }catch(e){
        return e
    }
}

async function deleteBook(fileName){
    try{
        const result=await client.delete(bookPath+fileName)
        return result
    }catch(e){
        return e
    }
}

async function uploadBookCover(imgName,buffer){
    try{
        const result=await client.put('/imgs/books-cover/'+imgName,buffer)
        return result
    }catch(e){
        return e
    }
}

async function getBookDownloadURL(path){
    try {
        const signUrl=await client.signatureUrl(path)
        return signUrl
    } catch (e) {
        return e
    }
}

async function getImgURL(path){
    try {
        const signUrl  = await client.signatureUrl(path);
        return signUrl
    }catch (e) {
        return e
    }
}

export {
    uploadBook,
    uploadBookCover,
    getImgURL,
    deleteBook,
    getBookDownloadURL
}