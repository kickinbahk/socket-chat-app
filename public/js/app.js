var socket = io()

socket.on('connect', function () {
  console.log('Connected to socket.io server')
})

socket.on('message', function (message) {
  console.log('New Message:')
  console.log(message.text)

  $('.messages').append(`<p>${message.text}</p>`)
})

// New message submission

var $form = $('#message-form')

$form.on('submit', function (event) {
  event.preventDefault()
  var $message = $form.find('input[name=message]')

  socket.emit('message', {
    text: $message.val()
  })
  $message.val('')
})
