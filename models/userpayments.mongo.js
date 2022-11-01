const mongoose = require('mongoose')
const payments_schema = new mongoose.Schema({
    USERID:{
        type:String
    },
    TOURNAMENT_ID:{
        type:String
    },
    PAYMENT_ID:{
        type:String
    },
    AMOUNT:{
        type:String
    },
    PAYMENT_STATUS:{
        type:Boolean
    }
})
module.exports = mongoose.model('payment',payments_schema)