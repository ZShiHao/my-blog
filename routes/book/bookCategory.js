import express from 'express'
import {mongooseConnectDb} from '../../config/db.js'
import bodyParser from 'body-parser'
import Category from "../../schema/book/category.js";
import {ObjectId} from "mongodb";

const router=express.Router()

const dbName='share-books'

router.post('/',bodyParser.json(),async (req,res)=>{
    try{
        await mongooseConnectDb(dbName)
        await Category.create(req.body)
        res.send('添加图书分类成功')
    }catch(e){
        res.send(e.message)
    }
})

router.put('/:_id',bodyParser.json(),async (req,res)=>{
    try{
        await mongooseConnectDb(dbName)
        const category=await Category.findOne({_id:new ObjectId(req.params._id)})
        const newKeys=category.keys.indexOf(req.body.key)===-1
        if (category.keys.indexOf(req.body.key)===-1){
            let newKeys=category.keys
            newKeys.push(req.body.key)
            await Category.updateOne({_id:new ObjectId(req.params._id)},{keys:newKeys})
            res.send('添加子分类成功')
        }else{
            res.send('已经有这个分类了')
        }
    }catch(e){
        res.send(e.message)
    }
})

export default router
