import mongoose from 'mongoose';
const { Schema } = mongoose;

const blogSchema=new Schema({
    title: String,
    name:{type:String,index:true},
    category:String,
    updateDate:Date,
    createTime:Date,
    tags:Array,
    activeStatus:Boolean,
    cover:String,
})

// const Blogs=mongoose.model('blogs',blogSchema)

export default blogSchema