var token = 'http://turtter-space.appspot.com/main#';
var channel = new goog.appengine.Channel(token);
var handler;
var socket;

sendMessage = function(path, payload) {
	if(payload) path += '?t=' + JSON.stringify(payload);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', path, true);
	xhr.send();
};

chat = function(turt) {
	sendMessage('/chat', turt);
}
 
onOpened = function() {
	sendMessage('/space');
};
 
onMessage = function(m) {
	turt = JSON.parse(m.data);
	$('#out_turt').val($('#out_turt').val() + "\n" + turt.statement);
}
 
openChannel = function() {
	handler = {
		'onopen': onOpened,
		'onmessage': onMessage,
		'onerror': function() {},
		'onclose': function() {}
	};
	socket = channel.open(handler);
	socket.onopen = onOpened;
	socket.onmessage = onMessage;
}
 
initialize = function() {
  openChannel();
}      

setTimeout(initialize, 100);