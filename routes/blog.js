import express from 'express'
import multer from 'multer'
import bodyParser from 'body-parser'
import {connectBlog,mongooseConnectDb} from '../config/db.js'
import {getCoverImgURL,list,uploadBlogBuffer,uploadCoverBuffer,getImgURL} from '../config/oss.js'
import { ObjectId} from  "mongodb"
import Blogs from "../schema/blog.js";
import moment from  'moment'

const router=express.Router()

/*
* TODO:
*   1.异常处理
*   2.代码注释
*   3.登录注册
*   4.添加数据库object mapper
*   5.REST风格API
*
* */

const dbName='my-blog'

const upload=multer({
    fileFilter(req,file,callback){
        file.originalname=Buffer.from(file.originalname,'latin1').toString('utf8')
        callback(null,true);
    },
})


router.post('/status',bodyParser.json(),async (req,res)=>{
    await mongooseConnectDb(dbName)
    const result=await Blogs.updateOne({_id:new ObjectId(req.body._id)},{activeStatus:req.body.activeStatus})
    res.send(result)
})

router.delete('/delete',async (req,res)=>{await mongooseConnectDb(dbName)
    const query = { _id:new ObjectId(req.query._id) };
    const result=await Blogs.deleteOne(query)
    console.log(result)
    res.send('删除成功')
})

router.post('/setting',upload.any(),async (req,res)=>{
    try {
        const newSetting={
            title:req.body.title,
            category:req.body.category,
            tags: req.body.tags.split(','),
            updateDate:new Date(),
            activeStatus:req.body.activeStatus==='true'?true:false,
        }
        await mongooseConnectDb(dbName)
        if (req.files.length!==0){
            await uploadCoverBuffer(req.files[0])
            newSetting.cover=req.files[0].originalname
        }
        const result=await Blogs.updateOne({_id:new ObjectId(req.query._id)},newSetting)
        res.send('更新设置成功')
    }catch (e) {
        res.send(e.message)
    }
})

// 获取博客详情
router.get('/detail',async (req,res)=>{
    await mongooseConnectDb(dbName)
    const query = { _id:new ObjectId(req.query._id) };
    const result=await Blogs.findOne(query)
    const URL=await getImgURL(result.cover)
    result.coverName=result.cover
    result.cover=URL
    res.send(result)
})

router.get('/list',async (req,res)=>{
    try {
        await mongooseConnectDb(dbName)
        const findResults=await Blogs.find({})
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
    console.log(req.body)
    const blog={
        title:req.body.title,
        name:req.files[0].originalname,
        category:req.body.category,
        updateDate:new Date(),
        createTime:new Date(),
        tags:req.body.tags.split(','),
        activeStatus:req.body.activeStatus==='true'?true:false,
        cover:req.files[1].originalname
    }
    try {
        await mongooseConnectDb(dbName)
        await Blogs.insertMany(blog)
        await uploadBlogBuffer(req.files[0])
        await uploadCoverBuffer(req.files[1])
        res.send('上传成功')
    }catch (e){
        console.log(e.message)
        res.send(e.message)
    }

})

export default router