const express=require('express')
const multer=require('multer')
const bodyParser = require('body-parser')
const md=require('../config/md')
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

// status接口处理跨域
// router.options('/', (req,res)=>{
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "POST,DELETE");
//     res.header("Access-Control-Allow-Headers", "Content-Type");
//     res.send()
// })


router.post('/status',bodyParser.json(),async (req,res)=>{
    console.log(req.body)
    const collection=await connectBlog()
    const result=await collection.updateOne({_id:new ObjectId(req.body._id)},{$set:{activeStatus:req.body.activeStatus}})
    console.log(result)
    res.send(result)
})

router.delete('/delete',async (req,res)=>{
    console.log(req.query)
    const collection=await connectBlog()
    const query = { _id:new ObjectId(req.query._id) };
    const result=await collection.deleteOne(query)
    console.log(result)
    res.send('删除成功')
})

// 获取博客详情
router.get('/detail',async (req,res)=>{
    const collection=await connectBlog()
    const query = { _id:new ObjectId(req.query._id) };
    const result=await collection.findOne(query)
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
        }))
        res.send(findResults)
    }catch (e) {
    }
})

// router.get('/:postId',async (req,res)=>{
//     const findResults=await postCollection.find({id:Number(req.params.postId)}).toArray()
//     const data=await fsPromises.readFile(findResults[0].path,{flag:'r'})
//     const htmlResult=md.render(data.toString('utf-8'))
//     res.header("Access-Control-Allow-Origin", "*");
//     res.send(htmlResult)
// })



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
        activeStatus:req.body.activeStatus==='true'?true:false,
        cover:req.files[1].originalname
    }
    console.log(blog)
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