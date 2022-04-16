const mongoose = require('mongoose')
const tabletennisschema = new mongoose.Schema({
    MATCHID:{
        type:String,
        required:true
    },
    TOURNAMENT_ID:{
        type:String,
        required:true
    },
    CATEGORY:{
        type:String
    },
    PLAYER1:{
        type:[String]//Array of userids for doubles. If single player just give one player in the array
    },
    PLAYER2:{
        type:[String]//Array of userids for doubles. If single player just give one player in the array
    },
    PLAYER1_SCORE:{
        type:Number
    },
    PLAYER2_SCORE:{
        type:Number
    },
    WINNER:{
        type:[String] //Array of userids for doubles. If single player just give one player in the array
    }        
})

module.exports = mongoose.model('tabletennis',tabletennisschema)