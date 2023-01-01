const express=require('express')
const multer=require('multer')
const bodyParser = require('body-parser')
const md=require('../config/md')
const {connectBlog}=require('../config/db')
const {getCoverImgURL,list,uploadBlogBuffer,uploadCoverBuffer,getImgURL}=require('../config/oss')
const { ObjectId} = require("mongodb");
const moment = require('moment')

const router=express.Router()

/*
* TODO:
*   1.异常处理
*   2.代码注释
*   3.登录注册
*   4.添加数据库object mapper
*
* */

const upload=multer({
    fileFilter(req,file,callback){
        file.originalname=Buffer.from(file.originalname,'latin1').toString('utf8')
        callback(null,true);
    },
})

console.log(moment(new Date()).fromNow())
console.log(new Date())

router.post('/status',bodyParser.json(),async (req,res)=>{
    const collection=await connectBlog()
    const result=await collection.updateOne({_id:new ObjectId(req.body._id)},{$set:{activeStatus:req.body.activeStatus}})
    res.send(result)
})

router.delete('/delete',async (req,res)=>{
    const collection=await connectBlog()
    const query = { _id:new ObjectId(req.query._id) };
    const result=await collection.deleteOne(query)
    res.send('删除成功')
})

router.post('/setting',upload.any(),async (req,res)=>{
    try {
        const newSetting={
            title:req.body.title,
            category:req.body.category,
            updateDate:new Date(),
            activeStatus:req.body.activeStatus==='true'?true:false,
        }
        const collection=await connectBlog()
        if (req.files.length!==0){
            await uploadCoverBuffer(req.files[0])
            newSetting.cover=req.files[0].originalname
        }
        const result=await collection.updateOne({_id:new ObjectId(req.query._id)},{$set:newSetting})
        res.send('更新设置成功')
    }catch (e) {
        res.send(e.message)
    }
})

// 获取博客详情
router.get('/detail',async (req,res)=>{
    const collection=await connectBlog()
    const query = { _id:new ObjectId(req.query._id) };
    const result=await collection.findOne(query)
    const URL=await getImgURL(result.cover)
    result.coverName=result.cover
    result.cover=URL
    res.send(result)
})

router.get('/list',async (req,res)=>{
    try {
        const collection=await connectBlog()
        const findResults=await collection.find().toArray()
        // 将cover的图片名转换成图片的访问url
        await Promise.all(findResults.map(async (blog)=>{
            const res=await getImgURL(blog.cover)
            blog.cover=res
            blog.createTime=moment(blog.createTime).fromNow()
        }))
        res.send(findResults)
    }catch (e) {
    }
})


router.post('/addBlog',upload.any(),async (req,res)=>{
    const blog={
        title:req.body.title,
        name:req.files[0].originalname,
        category:req.body.category,
        updateDate:new Date(),
        createTime:new Date(),
        tags:[],
        activeStatus:req.body.activeStatus==='true'?true:false,
        cover:req.files[1].originalname
    }
    try {
        const collection=await connectBlog()
        await collection.insert(blog)
        await uploadBlogBuffer(req.files[0])
        await uploadCoverBuffer(req.files[1])
        res.send('上传成功')
    }catch (e){
        console.log(e.message)
        res.send(e.message)
    }

})

module.exports=router