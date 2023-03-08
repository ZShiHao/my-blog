import {createClient} from "redis";
import secret from "./secret.js";

const redisClient=createClient({
    url:secret.redisUrl
})

redisClient.on('error', err => console.log('Redis Client Error', err));


export default redisClient
