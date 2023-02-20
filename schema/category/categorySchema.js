import mongoose from 'mongoose';
const { Schema } = mongoose;

const categorySchema=new Schema({
    name: {type:String,index:true,unique:true,required: true,},
    sort:Number,
    keys:Array
})


export default categorySchema