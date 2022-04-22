const tabletennis = require('../models/tabletennis.model')
function createMatches(arr){
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    const newarr = []
    for (var i =0;i<arr.length/2;i++){
        newarr.push({
            player1:arr[i],
            player2:arr[arr.length-1-i]
        })
    }
    return newarr;
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