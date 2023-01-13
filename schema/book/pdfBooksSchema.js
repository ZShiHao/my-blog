import mongoose from 'mongoose';
const { Schema } = mongoose;

const pdfBooksSchema=new Schema({
    title: {type:String},
    createDate:Date,
    published:String,
    coverUrl:String,
    category:String,
    activeStatus:Boolean,
    author:String,
    id: {type:String,unique:true},  // id using by download source web
    language:String,
    format:String,
    size:String,
    pages:String,
    downloads:Number,
    downloadPage:String,
    fileName: {type:String,unique: true}  //oss查询用
})


export default pdfBooksSchema