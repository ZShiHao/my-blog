import mongoose from 'mongoose'
const {Schema} =mongoose

const userSchema=new Schema({
    username:String,
    mobile_number:{type:String,index:true,unique:true},
    email:String,
    password:String,
    avatar:String
})

export default userSchema