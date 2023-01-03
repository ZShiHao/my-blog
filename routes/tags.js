import express from 'express'
import {connectTags} from '../config/db.js'
const router=express.Router()

router.get('/',async (req,res)=>{
    try{
        const collection =await connectTags()
        const findResults=await collection.find().toArray()
        const resBody=findResults.map(item=>item.name)
        res.send(resBody)
    }catch(e){
        res.status(404)
        res.send(e.message)
    }
})

export default router