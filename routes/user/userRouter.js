import express from "express";
import userSchema from "../../schema/user/userSchema.js";
import {mongooseConnectDb} from "../../config/db.js";
import bodyParser from "body-parser";
import jwt from 'jsonwebtoken'
import secret from "../../config/secret.js";
import redisClient from "../../config/redis.js";
import authorization from "../../middleware/authorization.js";
const router=express.Router()

const dbName='user'
const collection='user_bases'

const tokenExpire=3*2592000  //三个月

//新用户注册
router.post('/register',bodyParser.json(),async (req,res)=>{
    try {
        const Users=await mongooseConnectDb(dbName,collection,userSchema)
        const query={}
        const new_user={
            username: '',
            mobile_number:'',
            email:'',
            password:req.body.password,
            avatar:''
        }
        let err_message
        if (req.body.type===0){
            query.mobile_number=req.body.user
            new_user.mobile_number=req.body.user
            err_message='该手机号已注册过'
        }else{
            query.email=req.body.user
            new_user.email=req.body.user
            err_message='该邮箱已注册过'
        }
        const findRes=await Users.find(query)
        if (findRes.length===0){
            const access_token=jwt.sign({
                mobile_number:new_user.mobile_number,
                email:new_user.email,
                type:req.body.type   //判断是手机号登录还是邮箱登录,0是手机号登录,1是邮箱登录
            },secret.privateKey,{
                expiresIn:tokenExpire
            })
            await Users.create(new_user) //数据库添加新注册的用户
            await redisClient.connect() //redis保存已登录用户的token值
            await redisClient.set(req.body.user,access_token,{
                EX:tokenExpire
            })
            await redisClient.disconnect()
            const resBody={
                code:200,
                message: '注册成功',
                data:{
                    user_info:{
                        username:new_user.username,
                        mobile_number:new_user.mobile_number,
                        email:new_user.email,
                        avatar: new_user.avatar,
                        type:req.body.type
                    },
                    access_token
                }
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
router.post('/login',bodyParser.json(),async (req,res)=>{
    try {
        const query={}
        if (req.body.type===0){
            query.mobile_number=req.body.user
            // new_user.mobile_number=req.body.user
        }else{
            query.email=req.body.user
            // new_user.email=req.body.user
        }
        const Users=await mongooseConnectDb(dbName,collection,userSchema)
        const findRes=await Users.find(query)
        if (findRes.length!==0){
            if (findRes[0].password===req.body.password){
                // 密码正确
                const access_token=jwt.sign({
                    mobile_number:findRes[0].mobile_number,
                    email:findRes[0].email,
                    type:req.body.type   //判断是手机号登录还是邮箱登录,0是手机号登录,1是邮箱登录
                },secret.privateKey,{
                    expiresIn:tokenExpire
                })
                await redisClient.connect() //redis保存已登录用户的token值
                await redisClient.set(req.body.user,access_token,{
                    EX:tokenExpire
                })
                await redisClient.disconnect()
                const resBody={
                    code:200,
                    message: '登录成功',
                    data:{
                        user_info:{
                            username:findRes[0].username,
                            mobile_number:findRes[0].mobile_number,
                            email:findRes[0].email,
                            avatar: findRes[0].avatar,
                            type:req.body.type
                        },
                        access_token
                    }
                }
                res.send(resBody)
            }else{
                const resBody={
                    code:500,
                    message:'密码不正确'
                }
                res.send(resBody)
            }
        }else{
            const resBody={
                code:500,
                message:'请先注册'
            }
            res.send(resBody)
        }
    } catch (e) {
        const resBody={
            code:500,
            message:'登录失败'
        }
        res.send(resBody)
    }
})

//用户退出登录
router.post('/logout',authorization,bodyParser.json(),async (req,res)=>{
    try {
        const decoded=jwt.verify(req.body.access_token,secret.privateKey)
        let key
        if (decoded.type===0){
            // 手机登录
            key=decoded.mobile_number
        }else{
            // 邮箱登录
            key=decoded.email
        }
        await redisClient.connect()
        const val=await redisClient.del(key)
        await redisClient.disconnect()
        const resBody={
            code:200,
            message:'退出登录成功'
        }
        res.send(resBody)
    } catch (e) {
        const resBody={
            code:500,
            message:'无法退出登录'
        }
        res.send(resBody)
    }
})


export default router