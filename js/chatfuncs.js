
function appendAndScroll(item) {
	var isScrolledToBottom = scroller.scrollHeight - scroller.clientHeight <= scroller.scrollTop + 1;

	messages.appendChild(item);

	if (isScrolledToBottom) messages.scrollIntoView(false);
}

function objectToQueryString(obj) {
	var str = [];
	for (var p in obj) {
		if (p == 'name') obj[p] = obj[p].split(' ').map(i => i.charAt(0)).join(' ');
		if (obj.hasOwnProperty(p)) {
			str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
		}
	}
	return str.join("&");
}

function msgAPI(obj) {
	var xhttp = new XMLHttpRequest();
	xhttp.responseType = "document";
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			appendAndScroll(this.response.body.firstChild);
		}
	};
	xhttp.open("GET", "https://laravel.test/chat/api?" + objectToQueryString(obj), true);
	xhttp.send();
}