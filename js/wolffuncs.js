//Players List
var WOLVES_ = new Set([])
var list_cond = ''
const
	ALL = 1, OTHERS = 2, OTHERSNOTWOLF = 3,
	listattr = document.createAttribute('class'), baselinode = document.createElement('li');

listattr.value = 'list-disc list-inside pixel-pointer';
baselinode.setAttribute('onclick', 'vote(this)');
baselinode.className = 'hover:bg-indigo-200 whitespace-no-wrap'

function updatePlayersList(elem) {
	if (!player) return false;
	if (!list_cond) return 'empty condition';
	if (!elem) throw 'needs element parameter';
	list = document.createElement('ul');
	list.setAttributeNode(listattr.cloneNode());
	sortedusers.forEach(user => {
		if (list_cond == OTHERS || list_cond == OTHERSNOTWOLF) if (user.pid == player.pid) return;
		if (list_cond == OTHERSNOTWOLF) if (WOLVES_.has(user.pid)) return;
		linode = baselinode.cloneNode();
		linode.setAttribute('data-pid', user.pid);
		replaceHTML('<b>' + user.pid + '</b>' + '.' + user.username, linode);
		list.appendChild(linode);
	});
	clearElem(elem);
	elem.appendChild(list);
}
//ETC FUNCTIONS
function domGet(e) { return document.getElementById(e) }
function getData(player, dtype) {
	if (dtype === false || dtype === undefined) return false;
	return document.getElementsByClassName(dtype)[player - 1].innerHTML
}
function setData(player, dtype, data) {
	if (dtype === false || dtype === undefined) return false;
	if (dtype == 1) dtype = 'status';
	if (dtype == 0) dtype = 'name';
	if (data) document.getElementsByClassName(dtype)[player - 1].innerHTML = data
}
function setImg(player, url) {
	document.getElementsByClassName('img')[player - 1].src = url;
}
function showhideData(player, dtype, hide) {
	if (dtype === false || dtype === undefined) return false;
	if (hide) document.getElementsByClassName(dtype)[player - 1].classList.add("hidden");
	else document.getElementsByClassName(dtype)[player - 1].classList.remove("hidden");
}
function showhideImg(player, hide) {
	if (hide) document.getElementsByClassName('img')[player - 1].classList.add("opacity-0");
	else document.getElementsByClassName('img')[player - 1].classList.remove("opacity-0");
}
function showHide(elem, hide) {
	if (hide) elem.classList.add("hidden");
	else elem.classList.remove("hidden");
}
function replaceHTML(html, el) {
	while (el.firstChild) el.removeChild(el.lastChild);
	el.insertAdjacentHTML('beforeend', html);
}
function insertHTML(html, el) {
	el.insertAdjacentHTML('beforeend', html);
}
function clearElem(elem) {
	while (elem.firstChild) elem.removeChild(elem.lastChild);
}
function clearMsg(amount) {
	if (!amount) amount = 999;
	let i = 0;
	while (messages.firstChild && i < amount) {
		messages.removeChild(messages.lastChild); i++
	}
}
function addMsg(msg, addonly) {
	var isScrolledToBottom = messages.scrollHeight - messages.clientHeight <= messages.scrollTop + 1;
	if (!addonly) { }
	messages.insertAdjacentHTML('beforeend', msg);
	if (isScrolledToBottom) messages.scrollTop = messages.scrollHeight;
}
function sendMsg(msg) {
	(data) = {
		from: cid,
		msg: msg,
		token: token
	}
	socket.send(data)
}
function sendCmd(msg) {
	msg = msg.substr(2);
	if (msg == 'help') {
		addMsg(
			`<div class="flex items-center pr-4 pt-2"><span class="flex ml-0.5 h-auto bg-red-500 text-yellow-50 text-sm font-normal rounded-sm px-1 p-1 items-end min-w-1/4 justify-between">
			<span>
			{Commands with * is what also happen if you're the host}<br>
			help: display this message!<br>
			clear: clear the messages<br>
			join: join the game with a random name (!WIP)<br>
			action: same as pressing ${HTML_Action}<br><br>
			{Commands from here require you to join the game first}<br>
			start: request to start the game and ready if you're not<br>
			*start: start the game if everyone is ready<br>
			ready: ready for the game<br>
			</span>
			<span class="text-black text-xs pl-1">$.js</span></span></div>`
		)
	}
	if (msg == 'clear') { clearMsg() }
	if (msg == 'action') { domGet('Action_btn').click() }
	if (!player) return false;
	if (msg == 'start') { socket.emit('start', (player)) }
	if (msg == 'ready') { socket.emit('ready', (player)) }
	if (msg == 'readyAll') { socket.emit('readyAll', (player)) }
}

url = (function urlParams() {	//thanks Stack
	var p = {};
	var parts = window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,
		function (m, k, v) {
			p[k] = v;
		});
	return p;
})()