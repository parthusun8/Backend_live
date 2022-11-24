const mongoose = require('mongoose')
const express = require('express')
const tournament = require('../models/tournament.model')
const {createMatches,saveMatch} = require('../Functions/createMatches.singles')
const evrouter = express.Router()
const ruleschema = require('../models/rules.mongo')
const usermodel = require('../models/user.mongo')
const matchesmodel = require('../models/matches.mongo')
const onlytourneys = require('../models/tourney.mongo')
//---------------------------------

//controller functions
//register
//login
//createTournament
//createMatch 
//MatchResults

// evrouter.post('/createTournament',async (req,res)=>{
//     //First Matches have to be created
//     //also demand userid
//     console.log(req.body)
//     try{
//         const blue = "0xff6BB8FF"
//         const green = "0xff03C289"
//         const badminton_url = "https://ardentbucketnew.s3.ap-south-1.amazonaws.com/badminton.png"
//         const tt_url = "https://ardentbucketnew.s3.ap-south-1.amazonaws.com/icons8-ping-pong-96.png"
//         const spotArray = []
//         const no_of_spots = req.body.NO_OF_KNOCKOUT_ROUNDS
//         for(let i =0;i<no_of_spots;i++){
//             spotArray.push(`${i}`)
//         }
//         req.body.SPOT_STATUS_ARRAY = spotArray
//         if(req.body.SPORT==='Badminton'){
//             req.body['COLOR'] = blue
//             req.body['IMG_URL'] = badminton_url
//             console.log(req.body['COLOR'])
//         }
        
//         else{
//             req.body['COLOR'] = green
//             req.body['IMG_URL'] = tt_url
//             console.log(req.body['COLOR'])
//         }   
//         const usr = await usermodel.findOne({
//             USERID:req.body.USERID
//         })
//         if(usr){
//             console.log("usr found")
//             if(req.body.SPORT=="Badminton"){
//                 req.body.TOURNAMENT_ID = `BA${req.body.USERID}${usr.HOSTED_TOURNAMENTS.length+1}`
//             }
//             else if(req.body.SPORT=="Table Tennis"){
//                 req.body.TOURNAMENT_ID = `TT${req.body.USERID}${usr.HOSTED_TOURNAMENTS.length+1}`
//             }
//             else if(req.body.SPORT=="Cricket"){
//                 req.body.TOURNAMENT_ID = `CR${req.body.USERID}${usr.HOSTED_TOURNAMENTS.length+1}`
//             }
//             console.log(req.body);
//             //update timings
//             const start_date = req.body.START_DATE
//             const end_date = req.body.END_DATE
//             const start_time = req.body.START_TIME //hour
//             const end_time = req.body.END_TIME //hour
//             const istConstant = 5*60*60*1000+30*60*1000
//             req.body.START_TIMESTAMP = new Date(new Date(parseInt(start_date.split("-")[2]),parseInt(start_date.split("-")[1])-1,parseInt(start_date.split("-")[0]),parseInt(start_time.split(":")[0]),parseInt(start_time.split(":")[1])).getTime() + istConstant).toISOString()
//             req.body.END_TIMESTAMP = new Date(new Date(parseInt(end_date.split("-")[2]),parseInt(end_date.split("-")[1])-1,parseInt(end_date.split("-")[0]),parseInt(end_time.split(":")[0]),parseInt(end_time.split(":")[1])).getTime() + istConstant).toISOString()            
//             // req.body.START_TIME = start_time.split(":")[0]+start_time.split(":")[1]
//             // req.body.END_TIME = end_time.split(":")[0]+end_time.split(":")[1]
//             const res1 = await new tournament(req.body).save()
//             const res2 = await new matchesmodel({
//                 TOURNAMENT_ID:req.body.TOURNAMENT_ID,
//                 TOURNAMENT_NAME:req.body.TOURNAMENT_NAME
//             }).save()
//             //update_event_manager_hosted_tournaments
//             if(res1&&res2){
//                 usermodel.updateOne({
//                     USERID:req.body.USERID
//                 },{
//                     $push:{
//                         HOSTED_TOURNAMENTS:req.body.TOURNAMENT_ID
//                     }
//                 },function(error,result){
//                     if(error){
//                         console.log(error)
//                         throw error
//                     }
//                     if(result){
//                         res.status(200).send({
//                             TOURNAMENT_ID:req.body.TOURNAMENT_ID
//                         })
//                     }
//                 })
//             }
//         }
//     }catch(error){
//         console.log(error);
//         res.status(404).send({
//             Message:"Error in Tournament Creation"
//         })
//     }
// })
//multiple tournament creation
//going with category array
evrouter.post('/createMultipleTournament',async (req,res)=>{
    //First Matches have to be created
    //also demand userid
    console.log(req.body)
    try{
        const blue = "0xff6BB8FF"
        const green = "0xff03C289"
        const badminton_url = "https://ardentbucketnew.s3.ap-south-1.amazonaws.com/badminton.png"
        const tt_url = "https://ardentbucketnew.s3.ap-south-1.amazonaws.com/icons8-ping-pong-96.png"
        const spotArray = []
        const no_of_spots = req.body.NO_OF_KNOCKOUT_ROUNDS.split("-")
        for(let i =0;i<no_of_spots.length;i++){
            var arr = new Array()
            for(let j=0;j<no_of_spots[i];j++){
                arr.push(`${j}`)
            }
            spotArray.push(arr)
        }
        req.body.SPOT_STATUS_ARRAY = spotArray[0]
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
            console.log('Request Body')
            console.log(req.body)
            console.log("usr found")
            if(req.body.SPORT=="Badminton"){
                req.body.TOURNAMENT_ID = `BA${Math.floor(100000 + Math.random() * 900000)}`
            }
            else if(req.body.SPORT=="Table Tennis"){
                req.body.TOURNAMENT_ID = `TT${Math.floor(100000 + Math.random() * 900000)}`
            }
            else if(req.body.SPORT=="Cricket"){
                req.body.TOURNAMENT_ID = `CR${Math.floor(100000 + Math.random() * 900000)}`
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
            // categories will be hyphen separated strings
            const new_obj = {...req.body}
            req.body.ENTRY_FEE = 0
            req.body.NO_OF_KNOCKOUT_ROUNDS = 0
            req.body.GOLD = 0
            req.body.SILVER = 0
            req.body.BRONZE = 0
            req.body.OTHER = 0
            req.body.PRIZE_POOL = req.body.PRIZE_POOL.split("-").reduce(function(a,b){return parseInt(a)+parseInt(b)},0)
            const result1 = await new onlytourneys(req.body).save()
            if(result1){
                console.log(`Categories as per request: ${new_obj.CATEGORY}`)
                const categories = new_obj.CATEGORY.split("-")
                const agecategories = new_obj.AGE_CATEGORY.split("-")
                const poolsize = new_obj.NO_OF_KNOCKOUT_ROUNDS.split("-")
                const gold = new_obj.GOLD.split("-")
                const silver = new_obj.SILVER.split("-")
                const bronze = new_obj.BRONZE.split("-")
                const others = new_obj.OTHER.split("-")
                const prizepools = new_obj.PRIZE_POOL.split("-")
                //new_obj.PRIZE_POOL.split("-")
                const entryfee = new_obj.ENTRY_FEE.split("-")
                for(var i=0;i<categories.length;i++){
                    if(categories[i]==`Men's Single`){
                        categories[i] = `MS`
                    }
                    else if(categories[i]==`Women's Single`){
                        categories[i] = `WS`
                    }
                }
                console.log(categories)
                const tid = new_obj.TOURNAMENT_ID
                const tname = new_obj.TOURNAMENT_NAME 
                let tourneys = []
                let tourneyMatches = []
                let tourneyID = []
                let rules = []
                for(var i=0;i<categories.length;i++){
                    var obj = {...req.body}
                    console.log(categories[i])
                    obj.CATEGORY = categories[i]
                    obj.AGE_CATEGORY = agecategories[i]
                    obj.TOURNAMENT_ID = tid+'-'+categories[i]+'-'+agecategories[i]
                    obj.TOURNAMENT_NAME = tname+'-'+categories[i]+'-'+agecategories[i]
                    obj.NO_OF_KNOCKOUT_ROUNDS = parseInt(poolsize[i])
                    obj.GOLD = parseInt(gold[i])
                    obj.SILVER = parseInt(silver[i])
                    obj.BRONZE = parseInt(bronze[i])
                    obj.OTHER = parseInt(others[i])
                    obj.PRIZE_POOL =parseInt(prizepools[i])
                    obj.ENTRY_FEE = parseInt(entryfee[i])
                    obj.SPOT_STATUS_ARRAY=spotArray[i]
                    tourneys[i] = obj
                    tourneyID[i] = obj.TOURNAMENT_ID
                    tourneyMatches[i] = {
                        TOURNAMENT_ID:obj.TOURNAMENT_ID,
                        TOURNAMENT_NAME:obj.TOURNAMENT_NAME
                    }
                    rules[i] = {
                        TOURNAMENT_ID:obj.TOURNAMENT_ID
                    }
                }
                const res1 = await tournament.insertMany(tourneys)  
                const res2 = await matchesmodel.insertMany(tourneyMatches)
                const res3 = await ruleschema.insertMany(rules)
                //update_event_manager_hosted_tournaments
                if(res1&&res2&&res3){
                    usermodel.updateOne({
                        USERID:req.body.USERID
                    },{
                        $push:{
                            HOSTED_TOURNAMENTS:{
                                $each:tourneyID
                            }
                        }
                    },function(error,result){
                        if(error){
                            console.log(error)
                            throw error
                        }
                        if(result){
                            res.status(200).send({
                                TOURNAMENT_ID:tourneyID.join(', ')
                            })
                        }
                    })
                }
            }

        }
    }
    catch(error){
        console.log(error);
        res.status(404).send({
            Message:"Error in Tournament Creation"
        })
    }
})
evrouter.get('/createMatches',async (req,res)=>{
    try{
        console.log(req.query.TOURNAMENT_ID)
        const splt = req.query.TOURNAMENT_ID.split("-")
        // if(splt[splt.length-1][0]!='U'){
        //     var r = req.query.TOURNAMENT_ID.split(" ")
        //     r[0]+='+'
        //     console.log('U')
        //     console.log(r[0])
        //     req.query.TOURNAMENT_ID = r[0]

        // }
        // const trn = await tournament.findOne({
        //     TOURNAMENT_ID:req.query.TOURNAMENT_ID
        // })
        // if(trn){
        //     if(trn.STATUS==false){
        //         res.status(200).send({

        //         })
        //     }
        // }
        const result = await createMatches(req.query.TOURNAMENT_ID)
        if(result){
            tournament.findOneAndUpdate({
                TOURNAMENT_ID:req.query.TOURNAMENT_ID
            },{
                STATUS:false
            },function(error,result){
                if(error){
                    console.log(error)
                    throw error
                }
                else{
                    const tid_base = req.query.TOURNAMENT_ID.split("-")[0]
                    console.log(`${tid_base} base id`)
                    onlytourneys.findOneAndUpdate({
                        TOURNAMENT_ID:tid_base
                    },{
                        REGISTRATION_CLOSES_BEFORE:0
                    },function(errr,resss){
                        if(errr){
                            throw errr
                        }
                        else{
                            res.status(200).send({
                                Message:'Matches Created'
                            })                    
                        }
                    })
                }
            })
        }
    }catch(err){
        console.log(err);
        res.status(404).send({
            Message:'Error in match creation'
        })
    }
})
evrouter.get('/changeImage',async (req,res)=>{
    const badminton_url = "https://mologds.s3.ap-south-1.amazonaws.com/badminton.png"
    const tt_url = "https://mologds.s3.ap-south-1.amazonaws.com/icons8-ping-pong-96.png"
    tournament.updateMany({
        IMG_URL:tt_url
    },{
        IMG_URL:"https://ardentbucketnew.s3.ap-south-1.amazonaws.com/icons8-ping-pong-96.png"
    },function(error,result){
        res.status(200).send(result)
    })
})

module.exports = evrouter

