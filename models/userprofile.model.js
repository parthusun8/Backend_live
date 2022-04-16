const mongoose=require("mongoose")

const base_profile=new mongoose.Schema({
  PROFILE_ID:{
    type:String,
    default:"default"
  },
  POINTS:{
    type:Number,
    default:0
  },
  LEVEL:{
    type:Number,
    default:0
  }
});

const trophy_room=new mongoose.Schema({
  TROPHY_NAME:{
    type:String,
    default:"default"
  },
  TROPHY_STATUS:{
    type:String,
    default:"default"
  }
});

const missions=new mongoose.Schema({
  MISSION_NAME:String
});

const scratch_card=new mongoose.Schema({
  SCRATCH_CARD:[] //array for scratch cards
});



const analytics=new mongoose.Schema({
  TOTAL_MATCHES:{
    type:Number,
  },
  MATCHES_PLAYED:{
    type:Number,
  },
  WIN_PROBABILITY:{
    type:Number,
  },
  WINS:{
    type:Number,
  },
  LOSSES:{
    type:Number
  }
});

const match_details=new mongoose.Schema({
  VENUE:{
    type:String,
    default:"default"
  },
  OPPONENT:{
    type:String,
    default:"default"
  },
  PID:{
    type:Number
  },
  RESULT:{
    type:Boolean
  },
  STATUS:{
    type:Boolean
  }
});
//user_history

const user_profile = new mongoose.Schema({
  base_profile:base_profile,
  trophy_room:trophy_room,
  missions:missions,
  analytics:analytics,
  match_details:match_details,
  scratch_card:scratch_card
})

module.exports=mongoose.model("user_profile",user_profile)