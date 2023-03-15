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
    }
});

module.exports = mongoose.model('cricketPlayers', cricketTeam);