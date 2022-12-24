const timings = new mongoose.Schema({
    TOURNAMENT_ID:{
        type:String
    },
    MATCHID:{
        type:String //0 indexed
    },
    START_TIMESTAMP:{
        type:String 
    },
    END_TIMESTAMP:{
        type:String
    }
})

module.exports = mongoose.model('timing',timings)
