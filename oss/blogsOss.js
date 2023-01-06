import client from "../config/oss.js";

async function list () {
    // 不带任何参数，默认最多返回100个文件。
    const result = await client.list();
    console.log(result)
}

async function getCoverImgURL(name){
    const result =await client.list({
        prefix:coverImagsPath+name,
        delimiter:'/'
    })
    return result.objects[0].url
}

async function uploadBlogBuffer(file){
    try {
        const result = await client.put('/blogs/'+file.originalname, file.buffer);
    } catch (e) {
        console.log(e);
    }
}

async function uploadCoverBuffer(file){
    try {
        const result = await client.put('/imgs/blogs-cover/'+file.originalname, file.buffer);
    } catch (e) {
        console.log(e);
    }
}

async function getImgURL(path){
    try {
        const signUrl  = await client.signatureUrl(path);
        return signUrl
    }catch (e) {

    }
}


export {
    list,
    getCoverImgURL,
    uploadBlogBuffer,
    uploadCoverBuffer,
    getImgURL
}