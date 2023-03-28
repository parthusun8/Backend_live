const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const port = process.env.PORT||3000 // to be upgraded for .env files later
const {Server} = require('socket.io');
const tabletennis = require('../models/tabletennis.model')
const tournament = require('../models/tournament.model')
const user = require('../models/user.mongo')
const instacricket = require('../models/instacricket.mongo');
const tournamentModel = require('../models/tournament.model');
const matchesmodel = require('../models/matches.mongo')
const dbles = require('../models/doubles.mongo');
const cricketModel = require('../models/cricket.model');
const score = require('../models/scoring.model');
const player = require('../models/team.model');

const io = new Server(server,{
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        forceNew:true
      }
})
//We are currently doing it for singles of raquet games(example: tabletennis)
io.on("connection",async (socket)=>{
    //console.log(socket.id);
    const socket_id = socket.id
    socket.on('join-room',(obj1)=>{
        //entity can have values - USER/LIVE-MAINTAINER/ADMIN/EVENT-MANAGER
        //entityID means either USERID, LIVE-MAINTAINER_ID etc..
        //Tournament ID also required
        const obj = JSON.parse(obj1)
        console.log(obj);
        const entity = obj.entity
        const entity_ID = obj.entity_ID
        var roomname = obj.MATCHID+obj.TOURNAMENT_ID;
        var tourney_id = obj.TOURNAMENT_ID
        var matchid = obj.MATCHID
        console.log(roomname);
        let sport = obj.sport
        socket.join(roomname);
        console.log("Joined-room emitted")
        console.log(socket.id)
        socket.join(roomname);
        socket.to(socket.id).emit('joined-room',{
            Message:'Room'
        })
        // if(entity=="LIVE-MAINTAINER"){
        //     matchesmodel.updateOne({
        //         TOURNAMENT_ID:tourney_id
        //     },{
        //         $set:{
        //             "MATCHES.$[elem].SCORER":entity_ID
        //         }
        //     },{
        //         arrayFilters:[{"elem.MATCHID":matchid}]
        //     },function(error,result){
        //         if(error){
        //             console.log(error)
        //         }
        //         if(result){
        //             socket.to(socket.id).emit('joined-room',{
        //                 Message:'Random'
        //             })
        //         }
        //     })            
        // }
        // else{
        //     console.log("Joined-room emitted")
        //     console.log(socket.id)
        //     socket.join(roomname);
        //     socket.to(socket.id).emit('joined-room',{
        //         Message:'Room'
        //     })
        // }
        //update-score event for tabletennis
        //obj must also contain set details
        var setscore_array_p1 = [0,0,0,0,0]
        var setscore_array_p2 = [0,0,0,0,0]
        socket.on('update-score',async (obj1)=>{
            const obj = JSON.parse(obj1)
            const pl1score = obj.PLAYER_1_SCORE
            const pl2score = obj.PLAYER_2_SCORE
            const set  = parseInt(obj.set,10) - 1;
            console.log('Set No.:')
            console.log(obj.set);
            console.log(set);
            setscore_array_p1[set] = parseInt(pl1score,10)
            setscore_array_p2[set] = parseInt(pl2score,10)
            console.log(setscore_array_p1); 
            console.log(setscore_array_p2);
            let update_query
            if(obj.set=='1'){
                update_query = {
                    "MATCHES.$[elem].PLAYER1_SCORE.set1":pl1score
                    ,
                    "MATCHES.$[elem].PLAYER2_SCORE.set1":pl2score
                }
            }
            else if(obj.set=='2'){
                update_query = {
                    "MATCHES.$[elem].PLAYER1_SCORE.set2":pl1score
                    ,
                    "MATCHES.$[elem].PLAYER2_SCORE.set2":pl2score
                }
            }
            else if(obj.set=='3'){
                update_query = {
                    "MATCHES.$[elem].PLAYER1_SCORE.set3":pl1score
                    ,
                    "MATCHES.$[elem].PLAYER2_SCORE.set3":pl2score
                }

            }
            else if(obj.set=='4'){
                update_query = {
                    "MATCHES.$[elem].PLAYER1_SCORE.set4":pl1score
                    ,
                    "MATCHES.$[elem].PLAYER2_SCORE.set4":pl2score
                }

            }
            else if(obj.set=='5'){
                update_query = {
                    "MATCHES.$[elem].PLAYER1_SCORE.set5":pl1score
                    ,
                    "MATCHES.$[elem].PLAYER2_SCORE.set5":pl2score
                }
            }
            try{
                const match = await matchesmodel.updateOne({
                    TOURNAMENT_ID:tourney_id
                },{
                    $set:update_query
                },{
                    arrayFilters:[{"elem.MATCHID":matchid}]
                })
                if(match){
                    io.to(roomname).emit('score-updated',JSON.stringify({
                        set:obj.set,
                        PLAYER_1_SCORE:pl1score,
                        PLAYER_2_SCORE:pl2score
                    }))    
                    console.log(match);
                }
                else if(!match){
                    console.log('Error in finding match')
                    io.to(roomname).emit('ERROR',{
                        Message:'Match not found in db'
                    })    
                }
            }catch(err){
                console.log(err);
                socket.to(socket_id).emit('ERROR')
            }
        })
    })
    socket.on('finish-game',(obj)=>{
        //event called by live-maintainer
        //tournamentID, MATCHID
        //winner 
        const objkt = JSON.parse(obj)
        //update next match spot, winner of this match
        tournament.findOneAndUpdate({
            TOURNAMENT_ID:objkt.TOURNAMENT_ID,
            "MATCHES.ID":objkt.MATCHID
        },{
            $set:{
                "MATCHES.$.WINNER":[objkt.WINNERID]
            }
        },function(error,result){
            if(error){
                io.to(objkt.TOURNAMENT_ID).emit('Unknown Error')
            }
            if(result){
                if(result.NEXT_MATCH_PLAYER_SPOT==0){
                    tournament.updateOne({
                        TOURNAMENT_ID:objkt.TOURNAMENT_ID,
                        "MATCHES.ID":result.NEXT_MATCH_ID
                    },{
                        $set:{
                            "MATCHES.$.PLAYER1":objkt.WINNERID
                        }
                    },function(error,result){
                        if(result){
                            io.to(objkt.TOURNAMENT_ID).emit('Successfully Registered Winner')
                        }
                    })
                }
                else{
                    tournament.updateOne({
                        TOURNAMENT_ID:objkt.TOURNAMENT_ID,
                        "MATCHES.ID":result.NEXT_MATCH_ID
                    },{
                        $set:{
                            "MATCHES.$.PLAYER2":objkt.WINNERID
                        }
                    },function(error,result){
                        if(result){
                            io.to(objkt.TOURNAMENT_ID).emit('Successfully Registered Winner')
                        }
                    })

                }
            }
        })
    })
})


io.on("connection",(socket)=>{
    console.log(socket.id)
    socket.on('join-booking',(objk)=>{
        console.log(objk);
        const obj1 = JSON.parse(objk)
        const tid = obj1.TOURNAMENT_ID
        tournament.findOne({
            TOURNAMENT_ID:tid            
        },function(error,result){
            if(error){
                socket.emit('error',{
                    Message:'Tournament Not found'
                })
            }
            if(result){
                console.log(result)
                const spotStatusArray = result.SPOT_STATUS_ARRAY
                console.log("Inside join-booking");
                console.log(result.SPOT_STATUS_ARRAY)
                console.log("Emitted Spot Status Array")
                var output = {
                    total_spots:result.NO_OF_KNOCKOUT_ROUNDS,
                    array:spotStatusArray,
                    prize_pool:result.PRIZE_POOL,
                    entry_fee:result.ENTRY_FEE
                };

                if(result.SPORT == "Cricket"){
                    const cricket = cricketModel.findOne({
                        TOURNAMENT_ID:tid
                    });
                    output.TEAM_SIZE = cricket.TEAM_SIZE;
                    output.SUBSTITUTE = cricket.SUBSTITUTE;
                    output.OVERS = cricket.OVERS;
                    output.BALL_TYPE = cricket.BALL_TYPE;
                }
                socket.emit('spotStatusArray',JSON.stringify(output));
                socket.join(obj1.TOURNAMENT_ID)
            }
         })
        socket.on('spot-clicked',(objt)=>{
//            spotArray[obj.btnID].push(socket.id)
//get spotArray
            console.log(socket.id);
            console.log('Socket request');
            const obj = JSON.parse(objt)
            console.log(obj);
            console.log(obj.USERID)
            const tid = obj1.TOURNAMENT_ID
            console.log('Button')
            console.log(obj.btnID)
            tournament.findOne({
                TOURNAMENT_ID:tid
            },function(error,result){
                var color=''
                if(result.SPOT_STATUS_ARRAY[obj.btnID]===`${obj.btnID}`){
                    color='Orange'
                    result.SPOT_STATUS_ARRAY[obj.btnID] = obj.USERID
                    console.log("Inside Spot Clicked");
                    tournament.updateOne({
                        TOURNAMENT_ID:tid,
                        SPOT_STATUS_ARRAY:`${obj.btnID}`
                    },{
                        $set:{
                            "SPOT_STATUS_ARRAY.$":`${obj.USERID}-${obj.btnID}`
                        }
                    },function(error,result){
                        if(error){
                            console.log(error);
                        }
                        if(result){
                            // console.log(result);
                            console.log('In spot clicked return')
                            io.to(obj1.TOURNAMENT_ID).emit('spot-clicked-return',JSON.stringify({
                                btnID:obj.btnID,
                                color:color
                            }))
                            setTimeout(()=>{
                                console.log('In spot clicked return tourna')
                                console.log(parseInt(obj.btnID,10))
                                console.log(obj.TOURNAMENT_ID)
                                tournamentModel.findOne({
                                    TOURNAMENT_ID:obj.TOURNAMENT_ID
                                },function(error,result){
                                    if(error){
                                        console.log(error)

                                    }
                                    if(result){
                                        if(result.SPOT_STATUS_ARRAY.indexOf(`confirmed-${obj.USERID}`)==parseInt(obj.btnID,10)){
                                            console.log(result.SPOT_STATUS_ARRAY)
                                            console.log(`Payment already done ${obj.USERID}`)
                                            //here check if other spots containing the user name has been marked or not, if so then remove and replace with index of that spot

                                            io.to(obj.TOURNAMENT_ID).emit("not-to-be-removed")
                                        }
                                        else{
                                            tournament.updateOne({
                                                TOURNAMENT_ID:obj.TOURNAMENT_ID,
                                                SPOT_STATUS_ARRAY:`${obj.USERID}-${obj.btnID}`
                                            },{
                                                $set:{
                                                    "SPOT_STATUS_ARRAY.$":`${obj.btnID}`
                                                }
                                            },function(error,result2){
                                                if(error){
                                                    console.log(error)
                                                    io.to(obj.TOURNAMENT_ID).emit('error')
                                                }
                                                if(result2){
                                                    console.log("Emit remove from waiting list")
                                                    tournament.findOne({
                                                        TOURNAMENT_ID:obj.TOURNAMENT_ID
                                                    },function(errr,resss){
                                                        if(errr){
                                                            console.log(errr)
                                                        }
                                                        if(resss){
                                                            console.log(resss.SPOT_STATUS_ARRAY)
                                                            io.to(obj.TOURNAMENT_ID).emit('removed-from-waiting-list',{
                                                                btnID:obj.btnID
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    }
                                })
                            },1000*300)

                        }
                    })
                }
            })
        })
        socket.on('add-cricket-moongose', (obj) => {
            console.log("In add cricket mongoose");
        })
        socket.on('cancel-spot',(obj)=>{
            spotArray[obj.selectedButton].shift()
        })
        socket.on('confirm-booking',(objk)=>{
            console.log('In confirm booking')
            console.log(socket.id);
            const obj = JSON.parse(objk)
            console.log(obj);
            console.log(obj.TOURNAMENT_ID);
            const selectedButton = obj.btnId
            const btID = parseInt(obj.btnId,10)
            console.log(`${obj.USERID}-${btID-1}}`)
            tournament.findOneAndUpdate({
                TOURNAMENT_ID:obj.TOURNAMENT_ID,
                SPOT_STATUS_ARRAY:`${obj.USERID}-${btID-1}`
            },{
                $set:{
                    "SPOT_STATUS_ARRAY.$":`confirmed-${obj.USERID}`,
                }
            },function(error,result){
                if(error){
                    console.log(error)
                }
                if(result){
                    console.log('Booking Confirmed')
                    // console.log(result)
                    console.log(selectedButton)
                    user.findOne({
                        USERID:obj.USERID
                    },function(error,result){
                        if(error){
                            console.log(error)
                        }
                        if(result){
                            const current_bookings_array = result.CURRENT_TOURNAMENTS.indexOf(obj.TOURNAMENT_ID)
                            console.log(current_bookings_array)
                            if(current_bookings_array==-1){
                                user.updateOne({
                                    USERID:obj.USERID
                                },{
                                    $push:{
                                        CURRENT_TOURNAMENTS:obj.TOURNAMENT_ID   
                                    }
                                },function(error,result){
                                    if(error){
                                        console.log(error);
                                    }
                                    else{
                                        //here add condition for doubles
                                        if(obj.TOURNAMENT_ID.split("-")[1].includes('D')){
                                            //find the doubles guy and also add tournament to his bookings
                                            dbles.findOne({
                                                TOURNAMENT_ID:obj.TOURNAMENT_ID,
                                                PLAYER_1:obj.USERID
                                            },function(de,dr){
                                                if(de){
                                                    console.log(de)
                                                }
                                                else{
                                                    if(dr.PLAYER_2!='N.A'){
                                                        console.log('player2 update')
                                                        user.updateOne({
                                                            USERID:dr.PLAYER_2
                                                        },{
                                                            $push:{
                                                                CURRENT_TOURNAMENTS:obj.TOURNAMENT_ID   
                                                            }},async function(ue,ur){
                                                                if(ue){
                                                                    console.log(ue)
                                                                }
                                                                else{
                                                                    console.log('emitting booking-confirmed')
                                                                    io.to(obj1.TOURNAMENT_ID).emit('booking-confirmed',JSON.stringify({
                                                                        btnID:`${selectedButton}`
                                                                    })) 
                                                                }
                                                            })                   
                                                    }
                                                }
                                            })
                                        }
                                        else{
                                            console.log('emitting booking-confirmed')
                                            io.to(obj1.TOURNAMENT_ID).emit('booking-confirmed',JSON.stringify({
                                                btnID:`${selectedButton}`
                                            }))
                                        }
                                    }
                                })
                            }
                        }
                    })
                }
            })
        })
        // socket.on('remove-booking',(objkt)=>{
        //     //send spot number (0-based index)
        //     console.log("In remove booking")
        //     const obj = JSON.parse(objkt)
        //     tournamentModel.findOne({
        //         USERID:obj.TOURNAMENT_ID
        //     },function(error,result){
        //         if(error){
        //             console.log(error)
        //         }
        //         if(result){
        //             if(result.SPOT_STATUS_ARRAY.indexOf(`confirmed-${obj.USERID}`)!=-1){
        //                 console.log("Payment already done")
        //                 io.to(obj.TOURNAMENT_ID).emit("not-to-be-removed")
        //             }
        //             else{
        //                 tournament.updateOne({
        //                     TOURNAMENT_ID:obj.TOURNAMENT_ID,
        //                     SPOT_STATUS_ARRAY:obj.USERID
        //                 },{
        //                     $set:{
        //                         "SPOT_STATUS_ARRAY.$":`${obj.SPOTID}`
        //                     }
        //                 },function(error,result2){
        //                     if(error){
        //                         console.log(error)
        //                         io.to(obj.TOURNAMENT_ID).emit('error')
        //                     }
        //                     if(result2){
        //                         console.log("Emit remove from waiting list")
        //                         io.to(obj.TOURNAMENT_ID).emit('removed-from-waiting-list')
        //                     }
        //                 })
        //             }
        //         }
        //     })
        // })
    })
})

//Instantaneous Cricket matches
// io.on('connection',async (socket)=>{
//     console.log(socket.id)
//     socket.on('instacricket',(objkt)=>{
//         const obj = JSON.parse(objkt)
//         const matchid = obj.matchid  //string
//         instacricket.findOne({
//             matchid:matchid            
//         },function (error,result){
//             if(error){
//                 socket.emit('match-not-found',{
//                     Message:'Match Not Found'
//                 })
//             }
//             if(result){
//                 socket.join(matchid)
//             }
//         })
//         socket.on('update-score',(objt)=>{
//             //required batter_id, matchid, bowler_id,Batter_score,bowler_overs,bowler_runs_conceded,team_1 or team_2,total score
//             const obj = JSON.parse(objt)
//             if(obj.team=='team_1'){
//                 instacricket.findOneAndUpdate({
//                     matchid:obj.matchid
//                 },{
//                     $set:{
//                         "team_1.$[elem].runs_scored":obj.batter_score,
//                         team_1_score:obj.total_score
//                     }
//                 },{
//                     arrayFilters:[{
//                         "elem.USERID":obj.batter_id
//                     }]
//                 },function(error,result){
//                     if(error){
//                         console.log(error)
//                     }
//                     else{
//                         console.log(result)
//                         io.to(obj.matchid).emit('score-updated',{
//                             team:'team_1',
//                             batter_id:obj.batter_id,
//                             batter_score:obj.batter_score,
//                             bowler_id:bowler_id,
//                             bowler_runs_conceded:bowler_runs_conceded,
//                             bowler_overs:bowler_overs,
//                             total_score:total_score,
//                             total_wickets_fallen:total_wickets_fallen                                   
//                         })
//                     }
//                 })
//             }
//         })
//         socket.on('wicket',(objt)=>{
//             //required batter_id, matchid, bowler_id,Batter_score,bowler_overs,bowler_runs_conceded,team_1 or team_2,total_score,total_wickets,team_1 or team_2
//             //team_2
//             const obj = JSON.parse(objt)
//             instacricket.findOneAndUpdate({
//                 matchid:obj.matchid
//             },{
//                 $set:{
//                     team_1_wickets:total_wickets
//                 }
//             },function(error,result){
//                 if(error){
//                     console.log(error)
//                     socket.emit('error-in-score-updation',{
//                         Message:'Error in Updation'
//                     })
//                 }
//                 if(result){
//                     io.to(obj.matchid).emit('wickets-updated',{
//                             team:'team_1',
//                             batter_id:obj.batter_id,
//                             batter_score:obj.batter_score,
//                             bowler_id:bowler_id,
//                             bowler_runs_conceded:bowler_runs_conceded,
//                             bowler_overs:bowler_overs,
//                             total_score:total_score,
//                             total_wickets_fallen:total_wickets_fallen
//                     })
//                 }
//             })            
//         })
//         socket.on('finish-game', (objt)=>{
//             //should have team_1 score,team_2_score,team_1_wickets,team_2_wickets,overs,batter_who_got
//             console.log('Game Finished')
//         })
//     })
// })


//live cricket scoring
io.on('connection',async (socket)=>{
    console.log(socket.id);
    socket.on('join-scoring-live', (TOURNAMENT_ID, MATCH_ID) => {
        socket.join(TOURNAMENT_ID + MATCH_ID.toString());
    });

    socket.on('update-usual-score', (TOURNAMENT_ID, MATCH_ID, SCORE) => {
        console.log(TOURNAMENT_ID, MATCH_ID, SCORE);
        console.log('updated-usual-score');
        io.to(TOURNAMENT_ID + MATCH_ID.toString()).emit('usual-score-updated', SCORE);
    });

    socket.on('update-over-changed', (TOURNAMENT_ID, MATCH_ID, ballerIndex)=>{
        console.log(TOURNAMENT_ID, MATCH_ID, ballerIndex);
        console.log('updated-over-changed');
        io.to(TOURNAMENT_ID + MATCH_ID.toString()).emit('over-changed', ballerIndex);//emit mai baller Jaisa display hoga waisa format karna hai
    });

    socket.on('update-change-inning', (TOURNAMENT_ID, MATCH_ID)=>{
        console.log(TOURNAMENT_ID, MATCH_ID);
        console.log('updated-change-inning');
        io.to(TOURNAMENT_ID + MATCH_ID.toString()).emit('change-inning'); //No data needed for this
    });

    socket.on('update-out', (TOURNAMENT_ID, MATCH_ID, remarks, batterIndex)=>{
        console.log(TOURNAMENT_ID, MATCH_ID, remarks, batterIndex);
        console.log('updated-out');
        io.to(TOURNAMENT_ID + MATCH_ID.toString()).emit('out', remarks, batterIndex);//emit mai batter Jaisa display hoga waisa format karna hai
    });

    socket.on('update-special-runs', (TOURNAMENT_ID, MATCH_ID, remarks, extraRuns)=>{
        console.log(TOURNAMENT_ID, MATCH_ID, remarks, extraRuns);
        console.log('updated-special-runs');
        io.to(TOURNAMENT_ID + MATCH_ID.toString()).emit('special-runs', remarks, extraRuns);//emit mai batter Jaisa display hoga waisa format karna hai
    });

    socket.on('end-match', (TOURNAMENT_ID, MATCH_ID) => {
        console.log(TOURNAMENT_ID, MATCH_ID);
        console.log('end-match');
        io.to(TOURNAMENT_ID + MATCH_ID.toString()).emit('match-ended');
    });

    socket.emit('update-change-strike', (TOURNAMENT_ID, MATCH_ID) => {
        console.log(TOURNAMENT_ID, MATCH_ID);
        console.log('update-change-strike');
        io.to(TOURNAMENT_ID + MATCH_ID.toString()).emit('change-strike');
    });
});




server.listen(port,()=>{
    console.log(`Listening on port: ${port}`)
})
