// there is no import statement in node it is available in react
const express = require('express');
const sockeio = require('socket.io');
const http = require('http');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js')

const PORT = process.env.PORT || 5000;

const router = require('./router')

const app = express();
const server = http.createServer(app);
const io = sockeio(server);

io.on('connection', (socket) => {
    console.log('--- New Connection');

    socket.on('join', ({ name, room }, callback) => {

        console.log(socket.id, name, room);
        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) {
            return callback(error);
        }

        /* 
            admin generated message 
        */

        // simple greeting message to the user who joined
        socket.emit('message', { user: 'admin', text: `${user.name}, Welcome to the room ${user.room}` });

        // send message to everyone excluding the current user
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined` });
       
        /* 
            end of admin generated message
        */

        socket.join(user.room);

        // to call callback at frontend i.e. callback of socket.emit()
        // without any error
        callback();
    });

    // waiting to get message from client
    socket.on('sendMessage', (message, callback) => {
 
        console.log(socket.id);
        const user = getUser(socket.id);

        console.log(user);

        // send message to everyone
        io.to(user.room).emit('message', { user: user.name, text: message });

        callback();
    });

    socket.on('disconnect', () => {
        console.log('-- Disconnected'); 
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', 
            {user:'admin', text:`${user.name} has left...`});
        }
    })
})

// application level middleware
// middleware has access to req, res and next middleware functions
app.use(router)

server.listen(PORT, () => console.log(`server has started on ${PORT}`));