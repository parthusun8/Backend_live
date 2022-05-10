const express = require('express');
const app = express()
const cors = require('cors')
const userRouter = require('../routes/userRouter.router')
const livrouter = require('../routes/live_maintainer.router')
const evrouter = require('../routes/event_manager.router')
const mongoose = require('mongoose')

const uri = "mongodb+srv://Riddhiman_Mongo:hello123@cluster1.b76yf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
//mongoose.connect(uri)
app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(livrouter);
app.use(evrouter);
app.use(express.static(`${__dirname}/staticfiles`))
module.exports = app