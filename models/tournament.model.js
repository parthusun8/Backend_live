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
  ROUND_NO:{
      type:Number
  },
  TIME: [Number],
  WINNER:{
      type:[String] //Array of userids for doubles. If single player just give one player in the array
  },
  NEXT_MATCH_ID:{
      type:String
  },
  NEXT_MATCH_PLAYER_SPOT:{
    type:Number
  }        
})
const bd =new mongoose.Schema({
  TOURNAMENT_ID:{
    type:String,
    default:"123456"
  },
  TOURNAMENT_NAME:{
    type:String,
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
  START_DATE:{
    type:String
  },
  COLOR:{
    type:String
  },
  END_DATE:{
    type:String
  },
  REGISTRATION_CLOSES_BEFORE:{
    type:Number,
    default:6 
  },
  START_TIME:{
    type:String
  },
  END_TIME:{
    type:String
  },
  SPORT:{
    type:String,    //drop down
  },
  CANCELLATION_STATUS:{
    type:Boolean,
    default:false,
  },
  CATEGORY:{
    type:String,
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
 // Array of participants
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
  GOLD:{
    type:Number
  },
  SILVER:{
    type:Number
  },
  BRONZE:{
    type:Number
  },
  OTHER:{
    type:Number
  },
  AGE_CATEGORY:{
    type:String
  },
  ENTRY_FEE:{
    type:Number,
    default:0    
  },
  IMG_URL:{
    type:String
  },
  START_TIMESTAMP:{
    type:String
  },
  END_TIMESTAMP:{
    type:String
  },
  ORGANIZER_NAME:{
    type:String
  },
  ORGANIZER_ID:{
    type:String
  }
});

module.exports=mongoose.model('tournament', bd);
