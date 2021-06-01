var socket = io.connect('http://localhost:3000')
var divVideoChatLobby = document.getElementById('video-chat-lobby')
var divVideoChat = document.getElementById('video-chat-room')
var joinButton = document.getElementById('join')
var userVideo = document.getElementById('user-video')
var peerVideo = document.getElementById('peer-video')
var roomInput = document.getElementById('roomName')
var creator = false

var iceServers = [
  { url: "stun:stun.services.mozilla.com"},
  { url: "stun1.l.google.com:19302"}
]

const constraints = {
  audio: true,
  video: {
    width: 1280,
    height: 720
  }
}

joinButton.addEventListener('click', () => {
  if (!roomInput.value) {
    return alert('Provide room name first')
  }

  socket.emit('join', roomInput.value)
})

socket.on('created', () => {
  creator = true
  
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    divVideoChatLobby.style = 'display:none'
    userVideo.srcObject = stream
  }).catch((e) => {
    console.log('Couldn\'t access camera', e)
  })
})

socket.on('joined', () => {
  creator = false

  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    divVideoChatLobby.style = 'display:none'
    userVideo.srcObject = stream
    socket.emit('ready', roomInput.value)
  }).catch((e) => {
    console.log('Couldn\'t access camera', e)
  })
})

socket.on('full', () => {
  alert('Room is full. Cant\'t join')
})

socket.on('candidate', () => {})

socket.on('offer', () => {})

socket.on('answer', () => {})