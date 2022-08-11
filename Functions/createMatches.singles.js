const tournament = require('../models/tournament.model')
const bd = require('../models/badminton.model')
async function createMatches(tournamentid){
    return new Promise((resolve,reject)=>{
        tournament.findOne({
            TOURNAMENT_ID:tournamentid
        },function(err,result){
            if(err){
                reject(404)
            }
            if(result){
                const n = result.NO_OF_KNOCKOUT_ROUNDS
                let i = n/2
                let start = 0
                let end = i-1
                var id = 0
                while(i){
                    let k =1
                    for(let j=start;j<=end;j=j+2){
                        result.MATCHES[j] = {
                            MATCHID:`${j}`,
                            TOURNAMENT_ID:tournamentid,
                            NEXT_MATCH_ID:`${end+k}`,
                            NEXT_MATCH_PLAYER_SPOT:0
                        }
                        result.MATCHES[j+1] = {
                            MATCHID:`${j+1}`,
                            TOURNAMENT_ID:tournamentid,
                            NEXT_MATCH_ID:`${end+k}`,
                            NEXT_MATCH_PLAYER_SPOT:1
                        }
                        if(id<result.SPOT_STATUS_ARRAY.length){
                            result.MATCHES[j] = {
                                PLAYER1:SPOT_STATUS_ARRAY[id],
                                PLAYER2:SPOT_STATUS_ARRAY[id+1],
                                MATCHID:`${j}`,
                                TOURNAMENT_ID:tournamentid,
                                NEXT_MATCH_ID:`${end+k}`,
                                NEXT_MATCH_PLAYER_SPOT:0
                            }
                            result.MATCHES[j+1] = {
                                PLAYER1:SPOT_STATUS_ARRAY[id+2],
                                PLAYER2:SPOT_STATUS_ARRAY[id+3],
                                MATCHID:`${j+1}`,
                                TOURNAMENT_ID:tournamentid,
                                NEXT_MATCH_ID:`${end+k}`,
                                NEXT_MATCH_PLAYER_SPOT:1
                            }      
                        }
                        k=k+1
                        id+=4
                    }
                    i=i/2
                    start=end+1
                    end=end+i
                }
                tournament.updateOne({
                    TOURNAMENT_ID:tournamentid
                },{
                    $addToSet:{
                        MATCHES:result.MATCHES
                    }
                },function(err,result2){
                    if(err){
                        console.log(err)
                    }
                    if(result2){
                        console.log(result2)
                        resolve(1)
                    }
                })
            }
        })
    })
}
async function saveMatch(player1,player2,tournamentid,index){
    await new tabletennis({
        MATCHID:String(index),
        TOURNAMENT_ID:tournamentid,
        PLAYER1:player1,
        PLAYER2:player2
    }).save()
}
module.exports = {
    createMatches,
    saveMatch
}