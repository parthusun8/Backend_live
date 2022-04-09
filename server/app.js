const express = require('express');
const app = express()
const cors = require('cors')
const userRouter = require('../routes/userRouter.router')
const mongoose = require('mongoose')

const uri = "mongodb+srv://Riddhiman_Mongo:hello123@cluster1.b76yf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(uri)
app.use(cors());
app.use(express.json())
app.use(userRouter);
module.exports = app