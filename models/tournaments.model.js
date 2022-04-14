const mongoose=require("mongoose")
const bd =new mongoose.Schema({
  TOURNAMENT_ID:{
    type:Number,
    required:true
  },
  STATUS:{
    type:Boolean,
    default:true,
    required:true
  },
  LOCATION:{
    type:String,
    required:true
  },
  TYPE:{
    type:Boolean,
    default:true,
    required:true
  },
  GEOTAG:{     
    type:String,//API CALL
    required:true
  },
  REGISTRATION_CLOSE_TIME:{
    type : Date, 
    default: Date.now,
    required:true
  },
  SPORT:{
    type:Array,    //drop down
    required:true
  },
  CANCELLATION_STATUS:{
    type:Boolean,
    default:false,
    required:true
  },
  CATEGORIES:{
    type:Array,
    required:true   //drop down
  }
});


//user_history

const base_data = mongoose.model('base_data', bd);

module.exports=base_data;