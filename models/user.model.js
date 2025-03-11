const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        minlength:[3,'username must be at least 3 characters long']

    },
    email:{
        type:String,
        unique:true,
        require:true,
        trim:true},
    fullname:{
        type:String,
        require:true,
        trim:true},
    password:{
        type:String,
        unique:true,
        required:true
        }
})
const User = mongoose.model('User', userSchema)
module.exports = User;
