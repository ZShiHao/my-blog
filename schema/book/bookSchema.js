import mongoose from 'mongoose';
import mongoosePaginate from "mongoose-paginate-v2";
const { Schema } = mongoose;

const bookSchema=new Schema({
    title: {type:String,index:true,unique:true},
    createDate:Date,
    cover:String,
    category:String,
    activeStatus:Boolean,
    author:String,
    language:Number,
    format:String,
    size:String,
    pages:String,
    downloads:Number,
    fileName:String
})

bookSchema.plugin(mongoosePaginate)


export default bookSchema