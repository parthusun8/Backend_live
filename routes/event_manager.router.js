const mongoose = require('mongoose')
const express = require('express')
const tournament = require('../models/tournament.model')
const {createMatches,saveMatch} = require('../Functions/createMatches.singles')
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
        const spotArray = []
        const no_of_spots = req.body.NO_OF_KNOCKOUT_ROUNDS
        for(let i =0;i<no_of_spots;i++){
            spotArray.push(`${i}`)
        }
        req.body.SPOT_STATUS_ARRAY = spotArray
        console.log(req.body);
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
    //Requirement = tournament id
    //participants array which we will get from the tournaments collection
    const TOURNAMENT_ID = req.body.TOURNAMENT_ID
    try{
        const result = await createMatches(TOURNAMENT_ID)
        if(result){
            tournament.updateOne({
                TOURNAMENT_ID:TOURNAMENT_ID
            },{
                MATCHES:result
            },function(error,rs){
                if(error){
                    console.log(error)
                    throw error
                }
                if(rs){
                    res.status(200).send({
                        Message:'Created Matches'
                    })
                }
            })
        }
    }catch(err){
        console.log(err);
        res.status(404).send({
            Message:'Tournament not found'
        })
    }
})
module.exports = evrouter