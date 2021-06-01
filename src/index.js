const path = require('path')
const express = require('express')
const socket = require('socket.io')
let app = express()

const publicDirectory = path.join(__dirname, '../public/')

app.use(express.static(publicDirectory))

let server = app.listen(3000, () => {
  console.log('Server is running on port 3000')
})

let io = socket(server)

io.on('connection', (socket) => {
  console.log('User connected:' + socket.id)

  socket.on('join', (roomName) => {
    let rooms = io.sockets.adapter.rooms;
    let room = rooms.get(roomName)

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
    socket.broadcast.to(roomName).emit('ready')
  })
  
  socket.on('candidate', (candidate, roomName) => {
    socket.broadcast.to(roomName).emit('candidate', candidate)
  })
  
  socket.on('offer', (offer, roomName) => {
    socket.broadcast.to(roomName).emit('offer', offer)
  })
  
  socket.on('answer', (answer, roomName) => {
    socket.broadcast.to(roomName).emit('answer', answer)
  })
})