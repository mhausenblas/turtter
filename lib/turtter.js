var userURI = '';
var previousTurt = '';

$(function(){
	
	signIn(); // make sure we have the user URI before we start - that's the graph we store the triples into ...
	
	rdfstore.create(function(store) {
		$('#in_turt').focus();
		
		$('#query_user_graph').live('click', function() {
			$('#in_turt').val('SELECT * FROM <' + userURI + '> WHERE { ?s ?p ?o . }');
			$('#in_turt').focus();
		});
		
		// see also:
		// http://stackoverflow.com/questions/302122/jquery-event-keypress-which-key-was-pressed
		// http://unixpapa.com/js/key.html
		$('#in_turt').keypress(function(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
			if (code == 13) { // ENTER
				processTurt(store);
			}
			if (code == 38) { // UP
				$('#in_turt').val(previousTurt);
			}
		});
	});
});


function signIn(){
	$('#signin').dialog({
		autoOpen: true,
		height: 200,
		width: 350,
		modal: true,
		closeOnEscape: false,
		open: function(event, ui) { $('.ui-dialog-titlebar-close').hide(); },
		buttons: {
			'Sign in ...': function() {
				userURI = $('#user_uri').val();
				$('#user_graph').html('Your space has the graph ID <code id="query_user_graph">'+ userURI + '</code>');
				onMessage({ data: { useruri : 'none', timestamp : 'now', statement : null } });
				$(this).dialog('close');
			}
		}
	});
}

function processTurt(store){
	var turt = $('#in_turt').val();
	var now = new Date();
	var timestamp = now.getUTCHours() + ':' + 
	 				(now.getUTCMinutes() < 10?'0' + now.getUTCMinutes():now.getUTCMinutes()) + ':' +
					(now.getUTCSeconds() < 10?'0' + now.getUTCSeconds():now.getUTCSeconds());
	
	if(turt.indexOf('SELECT') == 0 ){ // execute query
		querySpace(store, turt, function(results) {
			var b = ' ';
			for(r in results[0]){ // header row with the bindings
				b = b + ' ?' + r;
			}
			b = b + '\n';
			for(res in results){ // and now the bindings
				for(r in results[res]){
					if(results[res][r].token == 'uri') {
						b = b + ' <' + results[res][r].value + '>';
					}
					else {
						b = b + ' "' + results[res][r].value + '"';
					}
				}
				b = b + '\n';
			}
			$('#out_turt').val($('#out_turt').val() + "\n" + b);
			previousTurt = turt;
		});
	}
	else { // try to add turt
		addTurt(store, timestamp, turt, function() {
			$('#out_turt').val($('#out_turt').val() + timestamp + '   ' +  turt + "\n");
			chat({ data: { useruri : encodeURIComponent(userURI), timestamp : timestamp, statement : turt } });
			previousTurt = turt;
		});
	}
}
	
function addTurt(store, timestamp, turt, callback){
	var sparqlstr = 'INSERT DATA { GRAPH <' + userURI + '> { ' + turt + ' } }';
	console.log('turtter says: got input ' + sparqlstr);
	store.execute(sparqlstr, function(success, results){
		if(success) {
			console.log('turtter says: ADDED ' + turt);
			$('#in_turt').val("");
			callback();
		}
		else{
			alert('Bah, that wasn\'t even remotely Turtle ...');
		}
	});	
}

function querySpace(store, turt, callback){
	var sparqlstr = turt;
	console.log('turtter says: got input ' + sparqlstr);
	store.execute(sparqlstr, function(success, results){
		if(success) {
			console.log('turtter says: query executed with ' + results.length + " matches");
			callback(results);
		}
		else{
			alert('Bah, that wasn\'t even remotely Turtle ...');
		}
		$('#in_turt').val("");
	});
}