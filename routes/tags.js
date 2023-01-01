const express=require('express')
const {connectTags}=require('../config/db')
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

module.exports=router