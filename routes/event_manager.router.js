const mongoose = require('mongoose')
const express = require('express')
const tournament = require('../models/tournament.model')
const {createMatches,saveMatch} = require('../Functions/createMatches.singles')
const evrouter = express.Router()
const usermodel = require('../models/user.mongo')
const matchesmodel = require('../models/matches.mongo')
//---------------------------------

//controller functions
//register
//login
//createTournament
//createMatch 
//MatchResults

evrouter.post('/createTournament',async (req,res)=>{
    //First Matches have to be created
    //also demand userid
    console.log(req.body)
    try{
        const blue = "0xff6BB8FF"
        const green = "0xff03C289"
        const badminton_url = "https://mologds.s3.ap-south-1.amazonaws.com/badminton.png"
        const tt_url = "https://mologds.s3.ap-south-1.amazonaws.com/icons8-ping-pong-96.png"
        const spotArray = []
        const no_of_spots = req.body.NO_OF_KNOCKOUT_ROUNDS
        for(let i =0;i<no_of_spots;i++){
            spotArray.push(`${i}`)
        }
        req.body.SPOT_STATUS_ARRAY = spotArray
        if(req.body.SPORT==='Badminton'){
            req.body['COLOR'] = blue
            req.body['IMG_URL'] = badminton_url
            console.log(req.body['COLOR'])
        }
        
        else{
            req.body['COLOR'] = green
            req.body['IMG_URL'] = tt_url
            console.log(req.body['COLOR'])
        }   
        const usr = await usermodel.findOne({
            USERID:req.body.USERID
        })
        if(usr){
            console.log("usr found")
            if(req.body.SPORT=="Badminton"){
                req.body.TOURNAMENT_ID = `BA${req.body.USERID}${usr.HOSTED_TOURNAMENTS.length+1}`
            }
            else if(req.body.SPORT=="Table Tennis"){
                req.body.TOURNAMENT_ID = `TT${req.body.USERID}${usr.HOSTED_TOURNAMENTS.length+1}`
            }
            else if(req.body.SPORT=="Cricket"){
                req.body.TOURNAMENT_ID = `CR${req.body.USERID}${usr.HOSTED_TOURNAMENTS.length+1}`
            }
            console.log(req.body);
            //update timings
            const start_date = req.body.START_DATE
            const end_date = req.body.END_DATE
            const start_time = req.body.START_TIME //hour
            const end_time = req.body.END_TIME //hour
            const istConstant = 5*60*60*1000+30*60*1000
            req.body.START_TIMESTAMP = new Date(new Date(parseInt(start_date.split("-")[2]),parseInt(start_date.split("-")[1])-1,parseInt(start_date.split("-")[0]),parseInt(start_time.split(":")[0]),parseInt(start_time.split(":")[1])).getTime() + istConstant).toISOString()
            req.body.END_TIMESTAMP = new Date(new Date(parseInt(end_date.split("-")[2]),parseInt(end_date.split("-")[1])-1,parseInt(end_date.split("-")[0]),parseInt(end_time.split(":")[0]),parseInt(end_time.split(":")[1])).getTime() + istConstant).toISOString()            
            // req.body.START_TIME = start_time.split(":")[0]+start_time.split(":")[1]
            // req.body.END_TIME = end_time.split(":")[0]+end_time.split(":")[1]
            const res1 = await new tournament(req.body).save()
            const res2 = await new matchesmodel({
                TOURNAMENT_ID:req.body.TOURNAMENT_ID,
                TOURNAMENT_NAME:req.body.TOURNAMENT_NAME
            }).save()
            //update_event_manager_hosted_tournaments
            if(res1&&res2){
                usermodel.updateOne({
                    USERID:req.body.USERID
                },{
                    $push:{
                        HOSTED_TOURNAMENTS:req.body.TOURNAMENT_ID
                    }
                },function(error,result){
                    if(error){
                        console.log(error)
                        throw error
                    }
                    if(result){
                        res.status(200).send({
                            Message:"Successfully Created New Tournament"
                        })
                    }
                })
            }
        }
    }catch(error){
        console.log(error);
        res.status(404).send({
            Message:"Error in Tournament Creation"
        })
    }
})
evrouter.get('/createMatches',async (req,res)=>{
    try{
        const result = await createMatches(req.query.TOURNAMENT_ID)
        if(result){
            res.status(200).send({
                Message:'Matches Created'
            })
        }
    }catch(err){
        console.log(err);
        res.status(404).send({
            Message:'Error in match creation'
        })
    }
})

module.exports = evrouter