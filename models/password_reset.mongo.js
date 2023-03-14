const mongoose = require('mongoose')
const pwd_reset = new mongoose.Schema({
    USERID:{
        type:String,
        required:true
    },
    OTP:{
        type:String,
        required:true
    },
    TIMESTAMP:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('pwd_reset',pwd_reset)