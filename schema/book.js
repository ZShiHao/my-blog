import mongoose from 'mongoose';
const { Schema } = mongoose;

const bookSchema=new Schema({
    title: {type:[String],index:true},
    createDate:Date,
    cover:String,
    category:Array,
    activeStatus:Boolean,
    author:String,
})

const Books=mongoose.model('Books',bookSchema)

export default Books