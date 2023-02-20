import express from 'express'
import {mongooseConnectDb} from '../../config/db.js'
import bodyParser from 'body-parser'
import categorySchema from "../../schema/category/categorySchema.js";
import {ObjectId} from "mongodb";

const router=express.Router()

const dbName='share-books'
const collection='categories'


router.get('/',async (req,res)=>{
    try{
        const Categories=await mongooseConnectDb(dbName,collection,categorySchema)
        const result=await Categories.find({})
        const resBody={
            code:200,
            message:'成功了',
            data:{
                categories:result
            },
        }
        res.send(resBody)
    }catch(e){
        res.send(e.message)
    }
})

// 获取单个分类
router.get('/:_id',async (req,res)=>{
    try{
        const Categories=await mongooseConnectDb(dbName,collection,categorySchema)
        const result=await Categories.find({})
        res.send(result)
    }catch(e){
        res.send(e.message)
    }
})

// 添加图书分类
router.post('/',bodyParser.json(),async (req,res)=>{
    try{
        const Categories=await mongooseConnectDb(dbName,collection,categorySchema)
        console.log(req.body)
        const document={
            name:req.body.name,
            sort:0,
            keys:[{name: req.body.keys.name,crawler:false}]
        }
        await Categories.create(document)
        const categories=await Categories.find({})
        res.send(categories)
    }catch(e){
        res.send(e.message)
    }
})

// 添加图书子类
router.put('/:_id',bodyParser.json(),async (req,res)=>{
    try{
        const Categories=await mongooseConnectDb(dbName,collection,categorySchema)
        const category=await Categories.findOne({_id:new ObjectId(req.params._id)})

        let ifHas=false
        category.keys.forEach((subCategory)=>{
            subCategory.name===req.body.key?ifHas=true:''
        })
        if (!ifHas){
            let newKeys=category.keys
            const newsubCategory={
                name:req.body.key,
                crawler:false
            }
            newKeys.push(newsubCategory)
            await Categories.updateOne({_id:new ObjectId(req.params._id)},{keys:newKeys})
            const subCategory=await Categories.findOne({_id:new ObjectId(req.params._id)})
            res.send(subCategory)
        }else{
            res.send('已经有这个分类了')
        }
    }catch(e){
        console.log(e)
        res.send(e.message)
    }
})


// 删除分类或者子类
router.delete('/:_id',async (req,res)=>{
    try {
        const Categories=await mongooseConnectDb(dbName,collection,categorySchema)
        const query={_id:new ObjectId(req.params._id)}
        if(req.query.key){
            // 如果有url中有query参数,则是删除子分类
            const category=await Categories.findOne(query)
            let ifHas=false
            let index=0
            category.keys.forEach((subCategory,i)=>{
                if (subCategory.name===req.query.key){
                    ifHas=true
                    index=i
                }
            })
            if (ifHas){
                let newKeys=category.keys
                console.log(newKeys)
                newKeys.splice(index,1)
                await Categories.updateOne(query,{keys:newKeys})
                const subCategory=await Categories.findOne(query)
                res.send(subCategory)
            }else{
                res.send('没有这个子分类')
            }
        }else{
            // 如果没有query参数.则是删除分类
            await Categories.deleteOne(query)
            const  categories=await Categories.find({})
            res.send(categories)
        }
    } catch (e) {
        console.log(e.message)
        res.send(e.message)
    }

})

export default router
