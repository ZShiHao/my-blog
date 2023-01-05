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

router.post('/',bodyParser.json(),async (req,res)=>{
    try{
        const Categories=await mongooseConnectDb(dbName,collection,categorySchema)
        await Categories.create(req.body)
        res.send('添加图书分类成功')
    }catch(e){
        res.send(e.message)
    }
})

router.put('/:_id',bodyParser.json(),async (req,res)=>{
    try{
        const Categories=await mongooseConnectDb(dbName,collection,categorySchema)
        const category=await Categories.findOne({_id:new ObjectId(req.params._id)})
        const newKeys=category.keys.indexOf(req.body.key)===-1
        if (category.keys.indexOf(req.body.key)===-1){
            let newKeys=category.keys
            newKeys.push(req.body.key)
            await Categories.updateOne({_id:new ObjectId(req.params._id)},{keys:newKeys})
            res.send('添加子分类成功')
        }else{
            res.send('已经有这个分类了')
        }
    }catch(e){
        res.send(e.message)
    }
})

export default router
