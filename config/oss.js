const OSS=require('ali-oss')
const secret=require('./secret')

const coverImagsPath='imgs/post-cover/'

const client =new OSS({
    region:'oss-cn-hangzhou',
    accessKeyId:secret.accessKeyId,
    accessKeySecret:secret.accessKeySecret,
    bucket: 'zhangshihao-blog'
})

async function listBuckets() {
    try {
        // 列举当前账号所有地域下的存储空间。
        const result = await client.listBuckets();
    } catch (err) {
        console.log(err);
    }
}

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

async function getImgURL(img){
    try {
        const signUrl  = await client.signatureUrl('/imgs/blogs-cover/'+img);
        return signUrl
    }catch (e) {
        
    }
}

module.exports={
    listBuckets,
    list,
    getCoverImgURL,
    uploadBlogBuffer,
    uploadCoverBuffer,
    getImgURL
}