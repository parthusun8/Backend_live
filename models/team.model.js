const mongoose = require('mongoose');
const cricketTeam = new mongoose.Schema({
    TOURNAMENT_ID: {
        type: String,
    },
    PLAYERS : {
        type:[Object],
    },
    SUBSTITUTE : {
        type:[Object],
    },
    TEAM_NAME:{
        type:String,
    },
    CAPTAIN:{
        type:String,
    }
});

module.exports = mongoose.model('cricketPlayers', cricketTeam);