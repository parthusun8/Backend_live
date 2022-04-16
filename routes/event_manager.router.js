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
    //First Matches have to be created
    try{
        await new tournament(req.body).save()
        //update_event_manager_current_tournaments
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
evrouter.post('/createMatches',async (req,res)=>{
    const currtournament = await tournament.findOneAndUpdate({
        TOURNAMENT_ID:req.body.TOURNAMENT_ID
    },{
        MATCHES:["Matchid1,matchid2"]
    })  
    if(currtournament){
        res.status(200).send({
            Message:"Testing Going on..."
        })
    }
    else{
        res.status(404).send({
            Message:"Tournament not found"
        })
    }
})
module.exports = evrouter