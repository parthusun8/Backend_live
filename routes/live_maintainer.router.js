const express = require('express')
const liv = require('../models/live_maintainer.mongo')

const livrouter = express.Router()
livrouter.post('/createLiveMaintainer',async(req,res)=>{
    const newliv = new liv(req.body)   
    await newliv.save();
    res.status(200).send({
        Message:'Created a LiveMaintainer'
    })
})

module.exports = livrouter