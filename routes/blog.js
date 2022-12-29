const express=require('express')
const multer=require('multer')
const md=require('../config/md')
const fsPromises=require('node:fs/promises')
const {connectBlog}=require('../config/db')
const {getCoverImgURL,list,uploadBlogBuffer,uploadCoverBuffer,getImgURL}=require('../config/oss')
const {ObjectID, ObjectId} = require("mongodb");
const router=express.Router()

const upload=multer({
    fileFilter(req,file,callback){
        file.originalname=Buffer.from(file.originalname,'latin1').toString('utf8')
        callback(null,true);
    },
})


router.post('/status',async (req,res)=>{
    console.log(req.query)
    const collection=await connectBlog()
    const result=await collection.updateOne({_id:new ObjectId(req.query._id)},{$set:{activeStatus:req.query.activeStatus}})
    console.log(result)
    res.header("Access-Control-Allow-Origin", "*");
    res.send('hhh')
})

router.get('/detail',async (req,res)=>{
    const findResults=await postCollection.find({id:Number(req.query.id)}).toArray()
    const imgURL=await getCoverImgURL(findResults[0].img)
    findResults[0].imgURL=imgURL
    res.header("Access-Control-Allow-Origin", "*");
    res.send(findResults[0])
})


router.get('/list',async (req,res)=>{
    try {
        const collection=await connectBlog()
        const findResults=await collection.find().toArray()
        // 将cover的图片名转换成图片的访问url
        await Promise.all(findResults.map(async (blog)=>{
            const res=await getImgURL(blog.cover)
            blog.cover=res
        }))
        res.header("Access-Control-Allow-Origin", "*");
        res.send(findResults)
    }catch (e) {
    }
})

router.get('/:postId',async (req,res)=>{
    const findResults=await postCollection.find({id:Number(req.params.postId)}).toArray()
    const data=await fsPromises.readFile(findResults[0].path,{flag:'r'})
    const htmlResult=md.render(data.toString('utf-8'))
    res.header("Access-Control-Allow-Origin", "*");
    res.send(htmlResult)
})



router.post('/addBlog',upload.any(),async (req,res)=>{
    // const path='./blogs'+req.file.originalname
    // await fsPromises.writeFile(path,req.file.buffer)
    const blog={
        title:req.body.title,
        name:req.files[0].originalname,
        category:req.body.category,
        updateDate:new Date(),
        createTime:new Date(),
        tags:[],
        activeStatus:req.body.activeStatus,
        cover:req.files[1].originalname
    }
    try {
        const collection=await connectBlog()
        await collection.insert(blog)
        await uploadBlogBuffer(req.files[0])
        await uploadCoverBuffer(req.files[1])
        res.header("Access-Control-Allow-Origin", "*")
        res.send('上传成功')
    }catch (e){
        console.log(e.message)
        res.header("Access-Control-Allow-Origin", "*")
        res.send(e.message)
    }

})

module.exports=router