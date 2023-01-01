const { MongoClient } = require('mongodb');
const secret=require('./secret')

const uri = `mongodb://${secret.username}:${secret.password}@47.96.73.47:27017`;
const client = new MongoClient(uri);

async function connectDb(dbName) {
    try {
        console.log('开始连接数据库')
        await client.connect();
        console.log("Connected successfully to server");
        const db=await client.db(dbName)
        return db;
    }catch (e){
        console.log(e)
    }
}

async function connectBlog(){
    try {
        const db=await connectDb('my-blog')
        const collection=await db.collection('blogs')
        return collection
    }catch (e){
        console.log(e)
    }
}

async function connectCategory(){
    try {
        const db=await connectDb('my-blog')
        const collection=await db.collection('category')
        return collection
    }catch (e){
        console.log(e)
    }
}

async function connectTags(){
    try {
        const db=await connectDb('my-blog')
        const collection=await db.collection('tags')
        return collection
    }catch (e){
        console.log(e)
    }
}


module.exports={
    connectDb,
    connectCategory,
    connectBlog,
    connectTags
}