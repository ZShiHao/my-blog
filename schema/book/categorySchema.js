import mongoose from 'mongoose';
const { Schema } = mongoose;

const categorySchema=new Schema({
    name: {type:String,index:true,unique:true,required: true,},
    keys:Array
})


export default categorySchema