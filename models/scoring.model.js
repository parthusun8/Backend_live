const mongoose = require('mongoose')
const team = require('./team.model.js');
const batting = new mongoose.Schema({
    STRIKER : {
        type : String,
    },
    NON_STRIKER : {
        type : String,
    },
    SCORE : {
        type : Number,
        default : 0
    }
});
const inning = new mongoose.Schema({
    COMPLETED_OVER_DETAILS : {
        type : [String],
        default : []
    },
    CURRENT_OVER : {
        type : String,
        default : ""
    }, 
    BATTING_DETAILS : {
        type : batting,
    },
    BALLER : {
        type : String,
    },
    OVERS_DONE : {
        type : Number,
        default : 0
    },
    WICKETS : {
        type : Number,
        type : 0
    }
});
const match = new mongoose.Schema({
    MATCH_ID: {
        type: String,
        required: true,
    },
    TOURNAMENT_ID: {
        type: String,
        required: true,
    },
    TEAMS : {
        type : [team], //TEAM 1 AND TEAM 2
        default : []
    },
    STATUS : {
        type : Boolean, //TRUE IF MATCH IS COMPLETED
        default : false
    },
    WINNER : {
        type : String, //TEAM NAME
    },
    FIRST_INNING_DONE : {
        type : Boolean, //TRUE IF FIRST INNING IS COMPLETED
        default : false
    },
    INNING : { //2 Innings is defined 
        //basically first team A batting, then team B batting so 2 innings
        type : [inning],
        default : []
    }
});
const scoringSchema = new mongoose.Schema({
    TOURNAMENT_ID:{
        type:String,
        required:true
    },
    CURRENT_MATCH_NUMBER : {
        type: Number,
        default : 0,
        required: true
    }, 
    TOTAL_OVERS : {
        type: Number,
    },
    COMPLETED_MATCHES : { //TO STORE ALL THE MATCHES THAT ARE COMPLETED
        type : [Object],
        default : [],
    },
    MATCHES : {
        type : [match],
    }
});

module.exports = mongoose.model('scoring',scoringSchema)