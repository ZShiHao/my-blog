import mongoose from 'mongoose';
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

// const Books=mongoose.model('books',bookSchema)

export default bookSchema