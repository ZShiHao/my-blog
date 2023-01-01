const express=require('express')
const {connectCategory}=require('../config/db')
const router=express.Router()


router.get('/',async (req,res)=>{
    const collection =await connectCategory()
    const findResults=await collection.findOne()
    console.log(findResults)
    res.send(findResults)
})

module.exports=router
