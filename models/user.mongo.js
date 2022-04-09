const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  USERID:{
      type:String
  },
  PHONE:{
      type:String
  },
  NAME:{
      type:String
  },
  EMAIL:{
      type:String
  },
  PWD:{
      type:String
  },
  GENDER:{
      type:String
  },
  DOB:{
      type:Date
  },
  CITY:{
    type:String
  },
  STATE:{
    type:String
  },
  SPORTS_ACADEMY:{
    type:String
  },
  INTERESTED_SPORTS:[],  //String array
  FRIENDS_LIST:[], //String array// 
  PROFILE_ID:{
      type:String
  }
})

module.exports = mongoose.model("USER",userSchema)
// Just sample fields for testing