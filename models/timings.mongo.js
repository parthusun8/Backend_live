const mongoose = require('mongoose')
const per_match_estimated_time = new mongoose.Schema({
    TOURNAMENT_ID:{
        type:String
    },
    TIMING_IN_MINUTES:{
        type:String
    }
})
module.exports = mongoose.model('timing',per_match_estimated_time)