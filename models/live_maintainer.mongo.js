const mongoose = require('mongoose');
const live_maintainer_schema = new mongoose.Schema({
    LIVE_MAINTAINER_ID:{
        type:String,
        required:true
    },
    PHONE:{
        type:String,
        required:true
    },
    EMAIL:{
        type:String,
        required:true
    },
    PWD:{
        type:String,
        required:true
    },
    GENDER:{
        type:String,
        required:true
    },
    DOB:{
        type:String,
        required:true
    },
    CITY:{
        type:String,
        required:true
    },
    STATE:{
        type:String,
        required:true
    },
    SPORTS_ACADEMY:{
        type:String,
        required:true
    },      
    current_tournaments:[],  //array of tournament ids
    past_tournaments:[] //array of tournament ids
})

module.exports = mongoose.model("LIVE_MAINTAINER",live_maintainer_schema);