const socket = io()


//Elements
const $messageForm = document.querySelector('#messageForm');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#sendLocation');
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#messageTemplate').innerHTML;
const locationTemplate = document.querySelector('#locationTemplate').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('send', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessages', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
            url: message.url,
            username: message.username,
            createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html;
})

document.querySelector('#messageForm').addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disbaled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
     $messageFormButton.removeAttribute('disabled')
     $messageFormInput.value = ''
     $messageFormInput.focus()
        if(error)
        {
            return console.log(error)
        }
        console.log('Message delivered')
    });
})

$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation)
    {
        return alert('Geolocation is not support by your browser')
    }
    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((postion) => { 
        socket.emit('sendLocation',{
         'latitude': postion.coords.latitude,
         'longitude': postion.coords.longitude
        }, (message) => {
            $locationButton.removeAttribute('disabled')
            console.log(message)
        })
    })
})

socket.emit('join', {username, room}, (error) => {
  if(error)
  {
      alert(error)
      location.href = '/'
  }
})