const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const port = process.env.PORT||3000 // to be upgraded for .env files later
const {Server} = require('socket.io');
const tabletennis = require('../models/tabletennis.model')

const io = new Server(server)
//We are currently doing it for singles of raquet games(example: tabletennis)
io.on("connection",async (socket)=>{
    const socket_id = socket.id
    socket.on('join-room',(obj)=>{
        //entity can have values - USER/LIVE-MAINTAINER/ADMIN/EVENT-MANAGER
        //entityID means either USERID, LIVE-MAINTAINER_ID etc..
        console.log(obj);
        const entity = obj.entity
        const entity_ID = obj.entity_ID
        let roomname = obj.MATCHID;
        console.log(roomname);
        let sport = obj.sport
        socket.join(roomname);
        socket.to(socket_id).emit('joined-room',{
            Message:roomname 
        })
        if(entity=='LIVE-MAINTAINER'){
            io.to(roomname).emit('joined-match',{
                Message:`LIVE-MAINTAINER: ${entity_ID} has joined the match`
            })
        }
        else if(entity=='USER'){
            io.to(roomname).emit('joined-match',{
                Message:`USER: ${entity_ID} has joined the match`
            })
        }
        //update-score event for tabletennis
        //obj must also contain set details
        var setscore_array_p1 = [0,0,0]
        var setscore_array_p2 = [0,0,0]
        socket.on('update-score',async (obj)=>{
            const pl1score = obj.PLAYER_1_SCORE
            const pl2score = obj.PLAYER_2_SCORE
            const set  = parseInt(obj.set,10) - 1;
            console.log(obj.set);
            console.log(set);
            setscore_array_p1[set] = parseInt(pl1score,10)
            setscore_array_p2[set] = parseInt(pl2score,10)
            console.log(setscore_array_p1); 
            let update_query
            if(obj.set=='1'){
                update_query = {
                    "PLAYER1_SCORE.set1":pl1score
                    ,
                    "PLAYER2_SCORE.set1":pl2score
                }
            }
            else if(set=='2'){
                update_query = {
                    "PLAYER1_SCORE.set2":pl1score
                    ,
                    "PLAYER2_SCORE.set2":pl2score
                }
            }
            else if(set=='3'){
                update_query = {
                    "PLAYER1_SCORE.set3":pl1score
                    ,
                    "PLAYER2_SCORE.set3":pl2score
                }

            }
            try{
                const match = await tabletennis.findOneAndUpdate({
                    MATCHID:roomname
                },{
                    $set:update_query
                })
                if(match){
                    io.to(roomname).emit('score-updated',{
                        PLAYER_1_SCORE:pl1score,
                        PLAYER_2_SCORE:pl2score
                    })    
                    console.log(match);
                }
                else if(!match){
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
})
server.listen(port,()=>{
    console.log(`Listening on port: ${port}`)
})
