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
    const tid = req.body.TOURNAMENT_ID
    tournament.findOne({
        TOURNAMENT_ID:tid
    },function(error,result){
        if(error){
            res.status(404).send({
                Message:'Tournament Not Found'
            })
        }
        else if(result){
            const spotStatusArray = result.SPOT_STATUS_ARRAY
            const matches = []
            if(spotStatusArray.length==32){
                let j = 0
                for(let i=0;i<16;i++){
                    const pl1 = spotStatusArray[j].split("-")
                    const pl2 = spotStatusArray[j+1].split("-")
                    if(pl1.length==2 && pl2.length==2){
                        matches.push({pl1:pl1[1],pl2:pl2[1]})
                    }
                    j+=2
                }
            }
            tournament.updateOne({
                TOURNAMENT_ID:tid
            },{
                $addToSet:{
                    MATCHES:matches
                }
            },function(error,result){
                if(error){
                    console.log(error)
                    res.status(404).send({
                        Message:'Error occurred'
                    })
                }
                else{
                    if(result){
                        res.status(200).send({
                            Message:'Successfully created Matches'
                        })
                    }
                }
            })
        }
    })
})
module.exports = evrouter