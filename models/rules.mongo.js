const mongoose = require('mongoose')
const ruleschema = new mongoose.Schema({
    TOURNAMENT_ID:{
        type:String
    },
    RULES:{
        type:String,
        default:"N/A"
    }
})

module.exports = mongoose.model("rule",ruleschema)