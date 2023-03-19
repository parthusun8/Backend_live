const express = require('express');
const app = express()
const cors = require('cors')
const userRouter = require('../routes/userRouter.router')
const livrouter = require('../routes/live_maintainer.router')
const evrouter = require('../routes/event_manager.router')
const BookingRouter = require('../routes/booking_manager.router')
const mongoose = require('mongoose')
require('dotenv').config()

const uri = "mongodb+srv://Riddhiman_Mongo:hello123@cluster1.b76yf.mongodb.net/ArdentSport?retryWrites=true&w=majority";
mongoose.connect(uri)
app.use(express.urlencoded({
    extended:true
}))
app.set('view engine','ejs')
app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(livrouter);
app.use(evrouter);
app.use(BookingRouter);
app.use(express.static(`${__dirname}/staticfiles`))
module.exports = app