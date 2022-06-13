const mongoose = require('mongoose')
const badmintonschema = new mongoose.Schema({
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
        type:String//Array of userids for doubles. If single player just give one player in the array
    },
    PLAYER2:{
        type:String//Array of userids for doubles. If single player just give one player in the array
    },
    PLAYER1_SCORE:{
        set1:{
            type:Number,
            default:0
        },
        set2:{
            type:Number,
            default:0
        },
        set3:{
            type:Number,
            default:0
        }

    },
    PLAYER2_SCORE:{
        set1:{
            type:Number,
            default:0
        },
        set2:{
            type:Number,
            default:0
        },
        set3:{
            type:Number,
            default:0
        }
    },
    ROUND_NO:{
        type:Number
    },
    TIME: [Number],
    WINNER:{
        type:[String] //Array of userids for doubles. If single player just give one player in the array
    }        
})

module.exports = mongoose.model('badminton',badmintonschema)