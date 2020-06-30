// there is no import statement in node it is available in react
const express = require('express');
const sockeio = require('socket.io');
const http = require('http');

const PORT = process.env.PORT || 5000;

const router = require('./router')

const app = express();
const server = http.createServer(app);
const io = sockeio(server);

io.on('connection', (socket) => {
    console.log('--- New Connection');
    console.log(socket);

    socket.on('disconnect', () => {
        console.log('-- Disconnected')
    })
})

// application level middleware
// middleware has access to req, res and next middleware functions
app.use(router)

server.listen(PORT, () => console.log(`server has started on ${PORT}`));