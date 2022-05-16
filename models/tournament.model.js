const mongoose=require("mongoose")
const bd =new mongoose.Schema({
  TOURNAMENT_ID:{
    type:Number,
    default:123456
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
    type:[]
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
  }
});

module.exports=mongoose.model('tournament', bd);
