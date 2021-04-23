var socket = io(':2428', {
	transports: ["websocket", "polling"]
});

var scroller = document.getElementById('scroller');
var messages = document.getElementById('messages');
var form = document.getElementById('form');
var iname = document.getElementById('name');
var input = document.getElementById('input');

form.addEventListener('submit', function (e) {
	e.preventDefault();
	if (input.value) {
		socket.emit('chat message', input.value, iname.value || '?');
		msgAPI({
			type: 'text',
			text: input.value,
			you: true,
			name: iname.value || '?'
		})
		input.value = '';
	}
});

socket.on('chat message', function (msg, name) {
	msgAPI({
		type: 'text',
		text: msg,
		name: name
	});
});

socket.onAny((event, ...args) => {
	console.log(event, args);
});