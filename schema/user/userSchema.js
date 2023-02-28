import mongoose from 'mongoose'
const {Schema} =mongoose

const userSchema=new Schema({
    username:{type:String,index:true,unique:true},
    phone:{type:String,index:true,unique:true},
    email:{type:String,index:true,unique:true},
    password:String,
    avatar:String
})

export default userSchema