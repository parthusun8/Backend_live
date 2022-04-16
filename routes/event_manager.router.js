const mongoose = require('mongoose')
const express = require('express')
const tournament = require('../models/tournament.model')

const evrouter = express.Router()
//---------------------------------
//controller functions
//register
//login
//createTournament
//createMatch 
//MatchResults

evrouter.post('/createTournament',async (req,res)=>{
    try{
        await new tournament(req.body)
        res.status(200).send({
            Message:"Successfully Created New Tournament"
        })
    }catch(error){
        console.log(error);
        res.status(404).send({
            Message:"Error in Tournament Creation"
        })
    }
})

module.exports = evrouter