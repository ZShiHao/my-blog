import { MongoClient }  from 'mongodb'
import secret from './secret.js'
import mongoose from "mongoose";

const uri = `mongodb://${secret.username}:${secret.password}@47.96.73.47:27017`;

async function connectDb(dbName) {
    try {
        const client = new MongoClient(uri);
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

async function mongooseConnectDb(dbName,collection,schema){
    try {
        const options={
            dbName
        }
        const connection=await mongoose.createConnection(uri,options)
        return connection.model(collection,schema)
    }catch (e){
        console.log(e)
    }
}

export {
    connectDb,
    connectCategory,
    connectBlog,
    connectTags,
    mongooseConnectDb
}