import mongoose from 'mongoose';
const { Schema } = mongoose;

const categorySchema=new Schema({
    name: {type:String,index:true,unique:true,required: true,},
    keys:Array
})

const Category=mongoose.model('categories',categorySchema)

export default Category