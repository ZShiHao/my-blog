import express from 'express'
import {mongooseConnectDb} from '../../config/db.js'
import bodyParser from 'body-parser'
import categorySchema from "../../schema/book/categorySchema.js";
import {ObjectId} from "mongodb";

const router=express.Router()

const dbName='share-books'
const collection='categories'


router.get('/',async (req,res)=>{
    try{
        const Categories=await mongooseConnectDb(dbName,collection,categorySchema)
        const result=await Categories.find({})
        res.send(result)
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

router.post('/',bodyParser.json(),async (req,res)=>{
    try{
        const Categories=await mongooseConnectDb(dbName,collection,categorySchema)
        await Categories.create(req.body)
        const categories=await Categories.find({})
        res.send(categories)
    }catch(e){
        res.send(e.message)
    }
})

// 添加图书分类,子类
router.put('/:_id',bodyParser.json(),async (req,res)=>{
    try{
        const Categories=await mongooseConnectDb(dbName,collection,categorySchema)
        const category=await Categories.findOne({_id:new ObjectId(req.params._id)})
        const newKeys=category.keys.indexOf(req.body.key)===-1
        if (category.keys.indexOf(req.body.key)===-1){
            let newKeys=category.keys
            newKeys.push(req.body.key)
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

router.delete('/:_id',async (req,res)=>{
    try {
        const Categories=await mongooseConnectDb(dbName,collection,categorySchema)
        const query={_id:new ObjectId(req.params._id)}
        if(req.query.key){
            // 如果有url中有query参数,则是删除子分类
            const category=await Categories.findOne(query)
            if (category.keys.indexOf(req.query.key)!==-1){
                let newKeys=category.keys
                newKeys.splice(category.keys.indexOf(req.query.key),1)
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
