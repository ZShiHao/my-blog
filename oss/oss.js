import OSS  from "ali-oss"
import secret from '../config/secret.js'

const client =new OSS({
    region:'oss-cn-hangzhou',
    accessKeyId:secret.accessKeyId,
    accessKeySecret:secret.accessKeySecret,
    bucket: 'zhangshihao-blog',
    timeout:600000
})

async function listBuckets() {
    try {
        // 列举当前账号所有地域下的存储空间。
        const result = await client.listBuckets();
    } catch (err) {
        console.log(err);
    }
}



async function uploadBookCoverBuffer(name,buffer){
    try {
        const result = await client.put('/imgs/books-cover/'+name, buffer);
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
    client,
    listBuckets,
    getImgURL,
    uploadBookCoverBuffer,
}