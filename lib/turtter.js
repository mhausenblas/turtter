var userURI = ''

$(function(){
	rdfstore.create(function(store) {
		$('#send_turt').button();
		$("#in_turt").focus();
		$('#send_turt').click(function() {
			 processTurt(store);
		});
		$('#in_turt').keypress(function(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
			if (code == 13) {
				processTurt(store);
			}
		});
	});
});

function processTurt(store){
	var turt = $('#in_turt').val();
	var now = new Date();
	var timestamp = now.getUTCHours() + ':' + 
	 				(now.getUTCMinutes() < 10?'0' + now.getUTCMinutes():now.getUTCMinutes()) + ':' +
					(now.getUTCSeconds() < 10?'0' + now.getUTCSeconds():now.getUTCSeconds());
	
	if(turt.indexOf('SELECT') == 0 ){ // execute query
		querySpace(store, turt, function(results) {
			var b = ' ';
			for(res in results){
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
			$('#out_turt').val(b);
		});
	}
	else { // try to add turt
		addTurt(store, timestamp, turt, function() {
			$('#out_turt').val($('#out_turt').val() + timestamp + '   ' +  turt + "\n");
		});
	}
}
	
function addTurt(store, timestamp, turt, callback){
	var sparqlstr = 'INSERT DATA { ' + turt + ' }';
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