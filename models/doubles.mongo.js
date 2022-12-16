const mongoose = require('mongoose')
const dbles = new mongoose.Schema({
    TOURNAMENT_ID:{
        type:String
    },
    SPOT_NUMBER:{
        type:String,
    },
    PLAYER_1:{
        type:String
    },
    PLAYER_2:{
        type:String,
        default:"N.A"
    }
})

module.exports = mongoose.model('double',dbles)