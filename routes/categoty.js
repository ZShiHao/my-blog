import express from 'express'
import {connectCategory} from '../config/db.js'
const router=express.Router()


router.get('/',async (req,res)=>{
    const collection =await connectCategory()
    const findResults=await collection.findOne()
    console.log(findResults)
    res.send(findResults)
})

export default router
