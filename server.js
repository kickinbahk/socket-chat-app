var PORT = process.env.PORT || 3000
var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var moment = require('moment')

app.use(express.static(`${__dirname}/public`))

var clientInfo = {}

// Sends current users to provided socket
function sendCurrentUsers (socket) {
  var info = clientInfo[socket.id]
  var users = []

  if (typeof info === 'undefined') {
    return
  }
  Object.keys(clientInfo).forEach(function (socketId) {
    var userInfo = clientInfo[socketId]

    if (info.room === userInfo.room) {
      users.push(userInfo.name)
    }
  })
  socket.emit('message', {
    name: 'System',
    text: `Current users: ${users.join(', ')}`
  })
}

io.on('connection', function (socket) {
  console.log('User connected via socket.io')

  socket.on('disconnect', function () {
    var userData = clientInfo[socket.id]
    if (typeof userData !== 'undefined') {
      socket.leave(userData.room)
      io.to(userData.room).emit('message', {
        name: 'System',
        text: `<em>${userData.name} has left</em>`
      })
      delete clientInfo[socket.id]
    }
  })

  socket.on('joinRoom', function (req) {
    clientInfo[socket.id] = req
    socket.join(req.room)
    socket.broadcast.to(req.room).emit('message', {
      name: 'System',
      text: `<em>${req.name} has joined</em>`,
      timestamp: moment().valueOf()
    })
  })

  socket.on('message', function (message) {
    console.log(`Message received: ${message.text}`)

    if (message.text === '@currentusers') {
      sendCurrentUsers(socket)
    } else {
      message.timestamp = moment().valueOf()
      io.to(clientInfo[socket.id].room).emit('message', message)
    }
  })

  socket.emit('message', {
    name: 'System',
    text: 'Welcome to the chat app',
    timestamp: moment().valueOf()
  })
})

http.listen(PORT, function () {
  console.log('Server started!')
})
