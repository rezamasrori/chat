const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const {addUser , removeUser , getUser , getUsersInRoom}  = require('./users')
const PORT = process.env.PORT || 5000;
const router = require('./router')
const httpServer = require("http").createServer()
const app = express()
const server = http.createServer(app)
const io = socketio(server);
io.on('connection' , (socket) => {
    console.log("we have a new connections!!!");
    socket.on('join' , ({name , room} , callback)=>{
        console.log("name" , name , room)
        const {error , user } = addUser({id : socket.id , name , room});
        if(error) {
            console.log("error" , error)  
            return callback(error)
        }
        
        socket.emit('message' , {user: 'admin' , text:`${user.name} , welcome to the room ${user.room}`})
        socket.broadcast.to(user.room).emit('message' , {user : 'admin' , text :`${user.name} , has joinend!`})
        socket.join(user.room);
        io.to(user.room).emit('roomDate' , {room :user.room , users  :getUsersInRoom(user.room)})
        callback();
    })
    socket.on('sendMessage' , (message , callback) => {
        console.log("message" ,message)
        const user = getUser(socket.id);
        console.log("check item" , user , socket.id)
        io.to(user.room).emit('message' , {user : user.name , text : message});
        // io.to(user.room).emit('message' , {room : user.room , users  :getUsersInRoom(user.room)});

        callback();
    });

    socket.on('disconnect' , () => {
        console.log("User had left !!!")
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('message' , {user : 'admin' , text : `${user.name} has left`})
        }
    })
})

app.use(router)
server.listen(PORT , ()=> console.log(`Server has started on port ${PORT}`));

