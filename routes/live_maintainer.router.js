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

livrouter.post('/loginLiveMaintainer', async (req,res)=>{
    const livmaintainerid = req.body.LIVE_MAINTAINER_ID
    const pwd = req.body.pwd
    try{
        const livman = await liv.find({
            LIVE_MAINTAINER_ID:livmaintainerid,
            PWD:pwd
        })
        if(livman){
            res.status(200).send({
                Message:'LIVE_MAINTAINER Verified'
            })
        }
    }catch(err){
        res.status(404).send({
            Message:'LIVE_MAINTAINER Not Verified'
        })
    }
})

module.exports = livrouter