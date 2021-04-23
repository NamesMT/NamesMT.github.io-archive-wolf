//Votes
//Vote
var lastelem = baselinode;
function vote(elem, istext) {
	if (subphase != 1) return 'not voting phase';
	if (!istext) {
		if (lastelem == elem) {
			lastelem.classList.remove('bg-green-200');
			lastelem.classList.remove('text-yellow-800');
			lastelem = baselinode;
			socket.emit('vote', player.pid, 'unvote');
			return true;
		}
		lastelem.classList.remove('bg-green-200');
		lastelem.classList.remove('text-yellow-800');
		lastelem = elem;
		lastelem.classList.add('bg-green-200');
		lastelem.classList.add('text-yellow-800');
	}
	socket.emit('vote', player.pid, istext ? elem : elem.getAttribute('data-pid'));
}
function wolfvote(elem, istext) {
	if (phase != 1) return 'not wolf-voting phase';
	if (!istext) {
		if (lastelem == elem) {
			lastelem.classList.remove('bg-red-200');
			lastelem.classList.remove('text-yellow-800');
			lastelem = baselinode;
			socket.emit('wolfvote', player.pid, 'unvote');
			return true;
		}
		lastelem.classList.remove('bg-red-200');
		lastelem.classList.remove('text-yellow-800');
		lastelem = elem;
		lastelem.classList.add('bg-red-200');
		lastelem.classList.add('text-yellow-800');
	}
	socket.emit('wolfvote', player.pid, istext ? elem : elem.getAttribute('data-pid'));
}
//Protect
function protect(elem, istext) {
	if (phase != 1) return 'not protect phase';
	if (!istext) {
		if (lastelem == elem) {
			lastelem.classList.remove('bg-blue-300');
			lastelem.classList.remove('text-yellow-800');
			lastelem = baselinode;
			socket.emit('protect', player.pid, 'unvote');
			return true;
		}
		lastelem.classList.remove('bg-blue-300');
		lastelem.classList.remove('text-yellow-800');
		lastelem = elem;
		lastelem.classList.add('bg-blue-300');
		lastelem.classList.add('text-yellow-800');
	}
	socket.emit('protect', player.pid, istext ? elem : elem.getAttribute('data-pid'));
}
//Action
const
	TEAM_WOLF = {
		1: 1,
		2: 1,
		3: 1,
		4: 1,
		5: 1,
		6: 1
	},
	ROLE_PROTECT = {
		14: 1,
		16: 1
	}
const actionbtn = domGet('modal_confirm');
const VALID_ACTIONS = new Set(['Vote', 'Protect', 'Wolf Vote', 'Shaman Enchant', 'Action modal']);
const ACTIONS = {
	vote: {
		title: 'Vote',
		main: 'Click on the player\'s name to vote:',
		playerlist: { attr: 'vote(this)', cond: OTHERS }
	},
	wolfvote: {
		title: 'Wolf vote',
		main: 'Click on the player\'s name to vote:',
		playerlist: { attr: 'wolfvote(this)', cond: OTHERSNOTWOLF }
	},
	protect: {
		title: 'Protect',
		main: 'Click on the player\'s name to protect for tonight:',
		playerlist: { attr: 'protect(this)', cond: 'player.selfcount ? ALL : OTHERS' }
	},

	default: {
		title: 'Action',
		main: 'This is the action modal, there\'s no possible action at current phase...'
	}
};

function setAction(action) {
	if (!(VALID_ACTIONS.has(action))) throw 'Action invalid'
	actionbtn.value = action;
	action = action.replace(/\s+/g, '').toLowerCase();
	if (ACTIONS[action]) {
		replaceHTML(ACTIONS[action].title, domGet('modal-action-title'));
		replaceHTML(ACTIONS[action].main, domGet('modal-action-main'));
		if (ACTIONS[action].playerlist) {
			baselinode.setAttribute('onclick', ACTIONS[action].playerlist.attr);
			list_cond = eval(ACTIONS[action].playerlist.cond);
			showHide(domGet('modal-action-playerlist'))
		} else showHide(domGet('modal-action-playerlist'), 1)
	}
	else {
		replaceHTML(ACTIONS.default.title, domGet('modal-action-title'));
		replaceHTML(ACTIONS.default.main, domGet('modal-action-main'));
		showHide(domGet('modal-action-playerlist'), 1)
	}
}

function openAction() {
	return domGet('action-trigger').click();
}

function updateAction() {
	switch (true) {
		case (subphase == 1):
			setAction('Vote');
			break;
		case (phase == 1 && role in ROLE_PROTECT):
			setAction('Protect');
			break;
		case (phase == 1 && role in TEAM_WOLF):
			setAction('Wolf Vote');
			break;
		case (role == 3):
			setAction('Shaman Enchant')
			break;
		default:
			setAction('Action modal');
			break;
	}
	updatePlayersList(domGet('modal-action-playerlist'));
}

//FUNCTIONS
function henshin() {
	showHide(domGet('modal_confirm'));
	updateAction();
	switch (role) {
		case 1:
			return werewolf();
		case 3:
			return werewolf_shaman();
		case 14:
			return doctor();
		case 15:
			return seer();
		case 16:
			return bodyguard();
		case 97:
			return headhunter();
		default:
			return villager();
	};
}

//ROLE CONST
const
	SOLO = '<span style="color:darkgray">Solo</span>', VILLAGE = '<span style="color:lime">Village</span>', WOLVES = '<span style="color:red">Wolves</span>',
	WEREWOLF = '<span style="color:red">Werewolf</span>', SHAMAN = '<span style="color:crimson">Shaman</span>', VILLAGER = '<span style="color:lime">Villager</span>', DOCTOR = '<span style="color:blue">Doctor</span>', SEER = '<span style="color:blue">Seer</span>', HEADHUNTER = '<span style="color:darkslategray">Head Hunter</span>'
//ROLE CASES
function werewolf() {
	if (role == 1) {
		replaceHTML(`
		You are a ${WEREWOLF}, vote on a player to kill at night.
		<li>Team: ${WOLVES}</li>
		`, domGet('modal-1-content'))
	}
}
function werewolf_shaman() {
	if (role == 3) {
		replaceHTML(`
		You are a ${WEREWOLF} ${SHAMAN}, enchant a player at day and make them be seen as Wolf Shaman (Evil) for the next night.
		<li>You can also vote with other Wolves at night</li>
		<li>Team: ${WOLVES}</li>
		`, domGet('modal-1-content'))
	}
}
function doctor() {
	if (role == 14) {
		replaceHTML(`
		You are a ${VILLAGER} ${DOCTOR}, you can choose a player to protect each night.
		<li>You can protect yourself, but only once</li>
		<li>Team: ${VILLAGE}</li>
		`, domGet('modal-1-content'))
	}
}
function seer() {
	if (role == 15) {
		replaceHTML(`
		You are a ${VILLAGER} ${SEER}, you can check a player to see their role at night.
		<li>Team: ${VILLAGE}</li>
		`, domGet('modal-1-content'))
	}
}
function villager() {
	replaceHTML(`
		You are a ${VILLAGER}, keep up your senses and use your head to cooperate with who you trust to lynch the evil...<br>
		<li>Becareful with who you trust, or it will be a miserable ending for the town.</li>
		<li>Team: ${VILLAGE}</li>
		`, domGet('modal-1-content'))
}
function headhunter() {
	if (role == 97) {
		replaceHTML(`
		You are a ${HEADHUNTER}, try to get your target lynched.<br>
		<li>If your target die by other reasons, you will become a ${VILLAGER}.</li>
		<li>Team: ${SOLO}</li>
		`, domGet('modal-1-content'))
	}
}