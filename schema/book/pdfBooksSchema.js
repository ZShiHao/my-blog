import mongoose from 'mongoose';
import mongoosePaginate  from 'mongoose-paginate-v2';
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
    downloadPage:String, // download source web book download page
    downloadUrl:String,  // download source web book download url
    uploaded:Boolean,
    fileName: {type:String,unique: true}  //oss查询用
})
pdfBooksSchema.plugin(mongoosePaginate)


export default pdfBooksSchema