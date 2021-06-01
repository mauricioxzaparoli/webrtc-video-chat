const socket = io('http://localhost:3000')
const divVideoChatLobby = document.getElementById('video-chat-lobby')
const divVideoChat = document.getElementById('video-chat-room')
const joinButton = document.getElementById('join')
const userVideo = document.getElementById('user-video')
const peerVideo = document.getElementById('peer-video')
const roomInput = document.getElementById('roomName')

let userStream
let creator = false

const stunServers = {
  iceServers: [
    { urls: 'stun:stun.services.mozilla.com'},
    { urls: 'stun:stun.l.google.com:19302'}
  ]
}
const rtcPeerConnection = new RTCPeerConnection(stunServers)


const constraints = {
  audio: true,
  video: {
    width: 500,
    height: 500
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
  const divVideoChatLobby = document.getElementById('video-chat-lobby')

  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    userStream = stream
    divVideoChatLobby.style = 'display:none'
    userVideo.srcObject = stream
  }).catch((e) => {
    console.log('Couldn\'t access camera', e)
  })
})

socket.on('joined', () => {
  creator = false

  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    userStream = stream
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

socket.on('ready', () => {
  if (creator) {
    rtcPeerConnection.onicecandidate = OnIceCandidate
    rtcPeerConnection.ontrack = OnTrack
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream)
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream)
    rtcPeerConnection.createOffer().then((offer) => {
      rtcPeerConnection.setLocalDescription(offer)
      socket.emit('offer', offer, roomInput.value)
    }).catch((e) => console.log('Error', e))
  }
})

socket.on('candidate', (candidate) => {
  let iceCandidate = new RTCIceCandidate(candidate)
  rtcPeerConnection.addIceCandidate(iceCandidate)
})

socket.on('offer', (offer) => {
  if (!creator) {
    rtcPeerConnection.onicecandidate = OnIceCandidate
    rtcPeerConnection.ontrack = OnTrack
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream)
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream)
    rtcPeerConnection.setRemoteDescription(offer)
    rtcPeerConnection.createAnswer().then((answer) => {
      rtcPeerConnection.setLocalDescription(answer)
      socket.emit('answer', answer, roomInput.value)
    }).catch((e) => console.log('Error', e))
  }
})

socket.on('answer', (answer) => {
  rtcPeerConnection.setRemoteDescription(answer)
})

const OnIceCandidate = (event) => {
  if (event.candidate) {
    socket.emit('candidate', event.candidate, roomInput.value)
  }
}

const OnTrack = (event) => {
  peerVideo.srcObject = event.streams[0]
}