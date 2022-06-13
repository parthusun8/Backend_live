const badminton = require('../models/badminton.model')
const tournament = require('../models/tournament.model')
async function createMatches(tournamentid){
    let matches
    try{
        const tr = await tournament.find({
            TOURNAMENT_ID:tournamentid
        })
        if(tr){
            const no_of_matches = tr.NO_OF_KNOCKOUT_ROUNDS
            if(no_of_matches==32){
                const spotStatusArray = tr.SPOT_STATUS_ARRAY
                let j = 0;
                matches = []
                for(let i=0;i<16;i++){
                    const pl1 = spotStatusArray[j].split("-")[j]
                    const pl2 = spotStatusArray[j].split("-")[j+1]
                    matches.push({
                        pl1:pl1,
                        pl2:pl2
                    })
                    const bd = await new badminton({
                        MATCHID:String(i),
                        TOURNAMENT_ID:tournamentid,
                        PLAYER1:pl1,
                        PLAYER2:pl2
                    }).save()
                    if(bd){
                        j+=2
                    }
                }
            }   
            return matches;
        }
    }catch(error){
        console.log(error)
        throw error
    }
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