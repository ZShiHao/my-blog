import OSS  from "ali-oss"
import secret from '../config/secret.js'

const client =new OSS({
    region:'oss-cn-hangzhou',
    accessKeyId:secret.accessKeyId,
    accessKeySecret:secret.accessKeySecret,
    bucket: 'zhangshihao-blog'
})

export default client