const mongoose = require('mongoose')
const bdmatch = new mongoose.Schema({
    MATCHID:{
        type:String,
        required:true
    },
    TOURNAMENT_ID:{
        type:String,
        required:true
    },
    TOURNAMENT_NAME:{
        type:String
    },
    CATEGORY:{
        type:String
    },
    PLAYER1:{
        type:String,//Array of userids for doubles. If single player just give one player in the array,
        default:"Not Yet Assigned"
    },
    PLAYER2:{
        type:String,
        default:"Not Yet Assigned"//Array of userids for doubles. If single player just give one player in the array
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
        },
        set4:{
            type:Number,
            default:0
        },
        set5:{
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
        },
        set4:{
            type:Number,
            default:0
        },
        set5:{
            type:Number,
            default:0
        }
    },
    SCORER:{
        type:String,
        default:"Not Assigned"
    },
    ROUND_NO:{
        type:Number
    },
    TIME: [Number],
    NEXT_MATCH_ID:{
        type:String
    },
    NEXT_MATCH_PLAYER_SPOT:{
      type:Number
    },
    winner_id:{
        type:String
    },
    winner_name:{
        type:String
    },
    completion_status:{
        type:String,
        default:"Not Complete"
    }        
  })
  const tourna = new mongoose.Schema({
    TOURNAMENT_ID:{
        type:String
    },
    TOURNAMENT_NAME:{
        type:String
    },
    MATCHES:{
        type:[bdmatch]
    }
  })
  module.exports = mongoose.model('matches', tourna);