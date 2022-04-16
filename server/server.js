const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const port = process.env.PORT||3000 // to be upgraded for .env files later
const {Server} = require('socket.io');
const io = new Server(server)
io.on("connect",(socket)=>{
    console.log(socket.id);
    let roomname
    socket.on('join-room',(obj)=>{
        roomname = obj.roomid;
        socket.join(roomname);
        io.to(roomname).emit('Joined Match')
    })
    socket.on('update-score',(obj)=>{
        io.to(roomname).emit('new-score',{
            newscore1:obj.score1,
            newscore2:obj.score2
        })
    })
})
server.listen(port,()=>{
    console.log(`Listening on port: ${port}`)
})
