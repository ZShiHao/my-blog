import jwt from 'jsonwebtoken'
import secret from "../config/secret.js";
import redisClient from "../config/redis.js";


const authorization=async (req,res,next)=>{
    try {
        const token=req.get('Authorization').slice(7)
        const decoded=jwt.verify(token,secret.privateKey)
        // token验证通过
        const key=decoded.type===0?decoded.mobile_number:decoded.email //判断登录方式
        await redisClient.connect()
        const redisRes=await redisClient.get(key)
        if (redisRes===null){
            // token过期,重新登录
            const resBody={
                code:401,
                message:'登录已过期,请重新登录'
            }
            res.send(resBody)
        }else{
            if (redisRes===token){
                // token有效,允许访问
                next()
            }else{
                // 无效的token,删除并让用户重新登录
                await redisClient.del(key)
                const resBody={
                    code:401,
                    message:'登录无效,请重新登录'
                }
                res.send(resBody)
            }
        }
        await redisClient.disconnect()
    } catch (e) {
        const resBody={
            code:401,
            message:'未授权,请登录'
        }
        res.send(resBody)
    }
}

export default authorization