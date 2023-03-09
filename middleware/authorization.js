import jwt from 'jsonwebtoken'
import secret from "../config/secret.js";
import redisClient from "../config/redis.js";


const authorization=async (req,res,next)=>{
    try {
        const token=req.get('Authorization').slice(5)
        const decoded=jwt.verify(token,secret.privateKey)
        await redisClient.connect()
        const redisRes=await redisClient.get('13568943076')
        if (redisRes===null){
            const resBody={
                code:401,
                message:'未授权,请登录'
            }
            res.send(resBody)
        }else{
            if (redisRes===token){

            }

        }
        await redisClient.disconnect()
        console.log(redisRes)
        res.send('123')
    } catch (e) {
        const resBody={
            code:401,
            message:'未授权,请登录'
        }
        res.send(resBody)
    }
}

export default authorization