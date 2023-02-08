const mongoose = require('mongoose');
const cricketschema = new mongoose.Schema({
    TOURNAMENT_ID: {
        type: String,
        required: true
    },
    TEAM_SIZE : {
        type:Number,
        required:true
    },
    SUBSTITUTE : {
        type:Number,
        default:0,
        required:true
    }
});

module.exports = mongoose.model('cricket',cricketschema);