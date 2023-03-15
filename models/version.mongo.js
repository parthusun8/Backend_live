const mongoose = require('mongoose')
const version = new mongoose.Schema({
    key:{
        type:Number,
        default:1
    },
    androidVersion:{
        type:String
    },
    iosVersion:{
        type:String
    }
})

module.exports = mongoose.model('version',version)