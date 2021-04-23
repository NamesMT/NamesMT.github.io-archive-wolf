function join() {
	socket.emit('join', {
		username: input.value,
		cid: cid
	}, (ack) => {
		if (ack.status) {
			showHide(domGet('Action'));
			showHide(domGet('Join'), 1);
		}
	});
	input.value = '';
}
// Currently connected to my local server...
var socket = io('laravel.test:9635/' + (room ? room : url.room ? (url.room.match(/^\w+$/) ? url.room : 'default') : 'default'), {
	transports: ["websocket", "polling"]
});
var player;
var token;
var role = false;
var phase = -1;
var subphase = -1;
var lastusers;
var sortedusers;
//CONSTANTS
const
	//HTMLs
	HTML_Action = '<code class="bg-pink-300 px-1 rounded text-black">Actions</code>',

	toRole = {
		1: WEREWOLF,
		2: "Alpha Werewolf",
		3: WEREWOLF + ' ' + SHAMAN,
		4: "Wolf Seer",
		5: "Junior Werewolf",
		6: "Nightmare Werewolf",

		11: "Aura Seer",
		12: "Medium",
		13: "Jailer",
		14: DOCTOR,
		15: SEER,
		16: "Bodyguard",
		17: "Gunner",
		18: "Priest",
		19: VILLAGER,

		99: "Serial Killer",
		98: "Fool",
		97: HEADHUNTER
	};

//SOCKETS
socket.on("connect", () => {
	for (user = 1; user <= 16; user++) {
		setData(user, 0, '???'); setData(user, 1, '???'); showhideImg(user, true);
		showhideData(user, 'pt-top', 1);
		showhideData(user, 'pt-mid', 1);
	}
	showHide(domGet('Action'), 1);
	showHide(domGet('Join'));
	player = undefined;
});
socket.on("disconnect", (reason) => {
	addMsg(
		`<div class="flex items-center pr-4 pt-2"><span class="flex ml-0.5 h-auto bg-gray-300 text-gray-100 text-sm font-normal rounded-sm px-1 p-1 items-end min-w-1/4 justify-between">
		<span>Lost connect to server... ${reason}>span>
		<span class="text-black text-xs pl-1">$js</span></span></div>`
	)
});
socket.on('token', stoken => {
	token = stoken;
})


socket.on('lobby', (data) => {
	domGet('online').innerHTML = data
});
socket.on('joined', (data) => {
	domGet('joined').innerHTML = data
});
socket.on('game', (data) => {
	domGet('timer').innerHTML = data.timer;
	domGet('phase').innerHTML = (
		data.phase == 1 ? 'Night' :
			data.phase == 0 ? 'Day' + '.' + (data.subphase == 0 ? 'Discuss' : data.subphase == 1 ? 'Vote' : 'Rest') :
				data.phase)
	domGet('day').innerHTML = data.day;
	if (subphase != data.subphase) {
		subphase = data.subphase;
		if (phase != data.phase) {
			phase = data.phase;
			if (phase == 1) {
				document.body.style.backgroundImage = "url('https://i.imgur.com/uz3xvrp.gif')";
				msgbox.classList.add("bg-black");
				msgboxheader.classList.remove("text-yellow-100");
			}
			else {
				document.body.style.backgroundImage = "url('https://i.imgur.com/WpD7VgD.gif')";
				msgbox.classList.remove("bg-black");
				msgboxheader.classList.add("text-yellow-100");
			}
		}
		if (subphase == 2) document.body.style.backgroundImage = "url('https://i.imgur.com/tpNzm4P.gif')";
		updateAction();
	}
});

socket.on('message', (data) => {
	var msg = `
	<div class="flex items-center pr-4 pt-2">
		<span class="flex ml-0.5 h-auto ${(data.from.charAt(0) == '$') ? 'bg-red-700' : (data.from.charAt(0) == '#') ? 'bg-yellow-800' : data.spectator ? 'bg-gray-400' : 'bg-indigo-600'} text-yellow-50 text-sm font-normal rounded-sm px-1 p-1 items-end min-w-1/4 justify-between">
			<span>${data.msg}</span>
			<span class="text-black text-xs pl-1 whitespace-no-wrap">${data.from}</span>
		</span>
	</div>`;

	addMsg(msg)
});

socket.on('player', (data) => {
	player = (data);
	role = player.role;
	if (data.killed) { }
	if (role) {
		setData(player.pid, 1, toRole[role]);
		henshin();
	}
});

socket.on('dead', (player, reason) => {
	setImg(player, 'https://i.imgur.com/jHcag7w.jpg')
	setData(player, 1, reason)
});

socket.on('alert', (msg, noheader) => {
	alert(noheader ? '' : 'Error: ' + msg)
});

socket.on('users', (users, type) => {
	if (type == 'left') { setData(users, 0, '???'); setData(users, 1, 'Left	 :('); showhideImg(users, true) }
	else if (type == 'ready') { setData(users, 1, 'Ready!') }
	else {
		if (users == lastusers) return true;
		lastusers = users;
		sortedusers = users.sort((a, b) => (a.pid - b.pid));
		users.forEach((user) => {
			setData(user.pid, 0, user.username);
			showhideImg(user.pid)
		});
	}
});

socket.on('WOLVES_', pidarr => {
	WOLVES_ = new Set(pidarr);
	WOLVES_.forEach((wolfpid) => {
		if (wolfpid == player.pid) return;
		setData(wolfpid, 1, WOLVES);
	});
})

socket.on('vote', (data) => {
	console.log(data);
	for (let i = 1; i <= 16; ++i) {
		if (!data[i]) { showhideData(i, 'pt-top', 1); showhideData(i, 'pt-mid', 1) }
		else {
			if (data[i].voted) { setData(i, 'pt-top', '&#9876;' + data[i].voted); showhideData(i, 'pt-top') }
			else showhideData(i, 'pt-top', 1);
			if (data[i].votes) { setData(i, 'pt-mid', '&#9760;' + data[i].votes); showhideData(i, 'pt-mid') }
			else showhideData(i, 'pt-mid', 1);
		}
	}
});

socket.onAny((event, ...args) => {
	console.log(event, args)
});