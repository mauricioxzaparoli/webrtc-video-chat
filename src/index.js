const path = require('path')
const express = require('express')
const socket = require('socket.io')
var app = express()

const publicDirectory = path.join(__dirname, '../public/')

app.use(express.static(publicDirectory))

let server = app.listen(3000, () => {
  console.log('Server is running on port 3000')
})

var io = socket(server)

io.on('connection', (socket) => {
  console.log('User connected:' + socket.id)

  socket.on('join', (roomName) => {
    var rooms = io.sockets.adapter.rooms;
    var room = rooms.get(roomName)

    if (!room) {
      socket.join(roomName)
      socket.emit('created')
    } else if (room.size == 1) {
      socket.join(roomName)
      socket.emit('joined')
    } else {
      socket.emit('full')
    }

    console.log(rooms)
  })

  socket.on('ready', (roomName) => {
    console.log('Ready')
    socket.broadcast.on(roomName).emit('ready')
  })
  
  socket.on('candidate', (candidate, roomName) => {
    console.log('Candidate')
    socket.broadcast.on(roomName).emit('candidate', candidate)
  })
  
  socket.on('offer', (offer, roomName) => {
    console.log('Offer')
    socket.broadcast.on(roomName).emit('offer', offer)
  })
  
  socket.on('answer', (answer, roomName) => {
    console.log('Answer')
    socket.broadcast.on(roomName).emit('answer', answer)
  })
})