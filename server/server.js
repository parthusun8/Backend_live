const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const port = process.env.PORT||3000 // to be upgraded for .env files later
server.listen(port,()=>{
    console.log(`Listening on port: ${port}`)
})
