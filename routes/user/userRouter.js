import express from "express";
import userSchema from "../../schema/user/userSchema.js";
import {mongooseConnectDb} from "../../config/db.js";
import bodyParser from "body-parser";

const router=express.Router()

const dbName='user'
const collection='user_base'

//新用户注册
router.post('/register',bodyParser.json(),async (req,res)=>{
    try {
        const Users=await mongooseConnectDb(dbName,collection,userSchema)
        const query={}
        const new_user={
            username: '',
            phone:'',
            email:'',
            password:req.body.password,
            avatar:''
        }
        let err_message
        if (req.body.type===0){
            query.phone=req.body.user
            new_user.phone=req.body.user
            err_message='该手机号已注册过'
        }else{
            query.email=req.body.user
            new_user.email=req.body.user
            err_message='该邮箱已注册过'
        }
        const findRes=await Users.find(query)
        if (findRes.length===0){
            await Users.create(new_user)
            const resBody={
                code:200,
                message: '注册成功'
            }
            res.send(resBody)
        }else{
            const resBody={
                code:500,
                message:err_message
            }
            res.send(resBody)
        }
    } catch (e) {
        const resBody={
            code:500,
            message:e.message
        }
        res.send(resBody)
    }
})

//用户登录
router.post('/login',async (req,res)=>{
    try {

    } catch (e) {

    }
})


export default router