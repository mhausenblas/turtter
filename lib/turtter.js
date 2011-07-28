var userURI = '';
var previousStmt = '';

$(function(){
	
	signIn(); // make sure we have the user URI before we start - that's the graph we store the triples into ...
	
	initChannel(); // start up the channel
	
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
				$('#in_turt').val(previousStmt);
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
				$('#user_graph').html('Your personal space has the following graph URI: <code id="query_user_graph">'+ userURI + '</code>');
				joinSpace({ data: { useruri : userURI, timestamp : '', statement : 'JOIN' } });
				$(this).dialog('close');
			}
		}
	});
}

function processTurt(store){
	var stmt = $('#in_turt').val();
	var now = new Date();
	var timestamp = now.getUTCHours() + ':' + 
	 				(now.getUTCMinutes() < 10?'0' + now.getUTCMinutes():now.getUTCMinutes()) + ':' +
					(now.getUTCSeconds() < 10?'0' + now.getUTCSeconds():now.getUTCSeconds());
	
	if(stmt.indexOf('SELECT') == 0 ){ // execute query
		querySpace(store, stmt, function(results) {
			var b = stmt + '\n';
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
			$('#out_turt').val($('#out_turt').val() + '\n' + b);
			previousStmt = stmt;
		});
	}
	else { // try to add turt
		addTurt(store, timestamp, stmt, function() {
			$('#out_turt').val($('#out_turt').val() + timestamp + ' {' + userURI + '}: ' +  stmt + '\n');
			chat({ data: { useruri : encodeURIComponent(userURI), timestamp : timestamp, statement : stmt } });
			previousStmt = stmt;
		});
	}
}
	
function addTurt(store, timestamp, stmt, callback){
	var sparqlstr = 'INSERT DATA { GRAPH <' + userURI + '> { ' + stmt + ' } }';
	console.log('turtter says: got input ' + sparqlstr);
	store.execute(sparqlstr, function(success, results){
		if(success) {
			console.log('turtter says: ADDED ' + stmt);
			$('#in_turt').val("");
			callback();
		}
		else{
			alert('Bah, that wasn\'t even remotely Turtle ...');
		}
	});	
}

function querySpace(store, stmt, callback){
	var sparqlstr = stmt;
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