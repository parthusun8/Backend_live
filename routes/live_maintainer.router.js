const express = require('express')
const liv = require('../models/live_maintainer.mongo')
const tabletennis = require('../models/tabletennis.model')

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
livrouter.get('/retrievescores',async (req,res)=>{
    //MATCHID
    const matchid = req.query.MATCHID
    try {
        const doc = await tabletennis.findOne({
            MATCHID:matchid
        })
        res.status(200).send(doc)
    } catch (error) {
        res.status(404).send({
            Message:'Not found'
        })
    }
})
module.exports = livrouter