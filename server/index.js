// there is no import statement in node it is available in react
const express = require('express');
const sockeio = require('socket.io');
const http = require('http');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js')

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = sockeio(server);

io.sockets.on('connection', (socket) => {

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
        socket.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined` });

        /* 
            end of admin generated message
        */

        console.log('joined')
        socket.join(user.room);

        // send users list to everyone
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

        // to call callback at frontend i.e. callback of socket.emit()
        // without any error
        callback();
    });

    // waiting to get message from client
    socket.on('sendMessage', (message, callback) => {

        const user = getUser(socket.id);

        // send message to everyone except io socket i.e. server socket
        io.sockets.to(user.room).emit('message', { user: user.name, text: message });
        console.log(getUsersInRoom(user.room));
        callback();
    });
 
    socket.on('disconnect', () => {
        console.log('-- Disconnected');
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message',
                { user: 'admin', text: `${user.name} has left...` });
        }

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    })
})

// application level middleware
// middleware has access to req, res and next middleware functions
app.use(router);

// to prevent site from restricting resources
app.use(cors());

server.listen(PORT, () => console.log(`server has started on ${PORT}`));