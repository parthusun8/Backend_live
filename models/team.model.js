const mongoose = require('mongoose');
const player = new mongoose.Schema({
    NAME : {
        type:String,
        required : true,
    }, 
    USERID : {
        type:String,
        required : true,
    }, 
    RUNS : { //runs given by player while balling
        type: Number,
        default : 0,
    }, 
    WICKETS : {
        type: Number,
        default : 0,
    },
    SCORE : { //runs scored by player while batting
        type: Number,
        default : 0
    },
    BALLS : {
        type : Number,
        default : 0
    }
});
const substitutes = new mongoose.Schema({
    NAME : {
        type:String,
        required : true,
    }, 
    USERID : {
        type:String,
        required : true,
    }, 
    RUNS : { //runs given by player while balling
        type: Number,
        default : 0,
    }, 
    WICKETS : {
        type: Number,
        default : 0,
    },
    SCORE : { //runs scored by player while batting
        type: Number,
    }
});
const cricketTeam = new mongoose.Schema({
    TOURNAMENT_ID: {
        type: String,
    },
    PLAYERS : {
        type:[player],
    },
    SUBSTITUTE : {
        type:[substitutes],
    },
    TEAM_NAME:{
        type:String,
    },
    CAPTAIN:{
        type:String,
    }
});

module.exports = mongoose.model('cricketPlayers', cricketTeam);