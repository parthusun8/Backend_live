const mongoose=require("mongoose")
const bdmatch = new mongoose.Schema({
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
  },
  NEXT_MATCH_ID:{
      type:String
  }        
})
const bd =new mongoose.Schema({
  TOURNAMENT_ID:{
    type:String,
    default:"123456"
  },
  STATUS:{
    type:Boolean,
    default:true,
  },
  LOCATION:{
    type:String,
  },
  CITY:{
    type:String
  },
  ADDRESS:{
    type:String
  },
  TYPE:{
    type:String,
    default:"DYNAMIC",
  },
  GEOTAG:{     
    type:String,//API CALL
  },
  START_DATE:{
    type:String
  },
  END_DATE:{
    type:String
  },
  REGISTRATION_CLOSE_TIME:{
    type : Date, 
    default: Date.now,

  },
  SPORT:{
    type:String,    //drop down
  },
  CANCELLATION_STATUS:{
    type:Boolean,
    default:false,

  },
  CATEGORIES:{
    type:Array,
   //drop down
  },
  MATCHES:{  //array of match ids
    type:[bdmatch]
  },
  NO_OF_COURTS:{
    type:Number
  },
  BREAK_TIME:{
    type:String
  },
  PARTICIPANTS:{
    type:[String],
    default:['pl1','pl2','pl3','pl4'] // Array of participants
  },
  NO_OF_KNOCKOUT_ROUNDS:{
    type:Number
  },
  SPOT_STATUS_ARRAY:{
    type:[String],
    default:[]
  },
  PRIZE_POOL:{
    type:Number,
    default:0
  },
  ENTRY_FEE:{
    type:Number,
    default:0    
  }
});

module.exports=mongoose.model('tournament', bd);
