'use strict';

const express		= require('express');
const mysql			= require('mysql');

const bodyParser	= require('body-parser');

// SETUP!
const dbUser		= 'root';
const dbPass		= '';
const dbDB			= 'game';
const dbHost		= '127.0.0.1';
const PORT			= 8081;

const app			= express();

app.use( bodyParser.json() ); 
app.use(bodyParser.urlencoded({
  extended: true
}));

var sql;

function handleDisconnect() {
	sql = mysql.createConnection({
		host     : dbHost,
		user     : dbUser,
		password : dbPass,
		database : dbDB
	});

	sql.connect(function(err) {
		if(err) {
			console.log('[-] Error when connecting to database:', err);
			setTimeout(handleDisconnect, 2000);
		}
	});

	sql.on('error', function(err) {
		console.log('[-] Database error', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST') {
			handleDisconnect();
		} else {
			throw err;
		}
	});
}

handleDisconnect();

app.get('/', function (req, res) {

	var html = '';
	html = '<!DOCTYPE html><html><title></title><body>	' +
		'<b>Full use case example:</b><br />'+
		'<a href="/fund?playerId=P1&points=300">/fund?playerId=P1&points=300</a><br />'+
		'<a href="/fund?playerId=P2&points=300">/fund?playerId=P2&points=300</a><br />'+
		'<a href="/fund?playerId=P3&points=300">/fund?playerId=P3&points=300</a><br />'+
		'<a href="/fund?playerId=P4&points=500">/fund?playerId=P4&points=500</a><br />'+
		'<a href="/fund?playerId=P5&points=1000">/fund?playerId=P5&points=1000</a><br /><br />'+
		''+
		'<a href="/announceTournament?tournamentId=1&deposit=1000">/announceTournament?tournamentId=1&deposit=1000</a><br />'+
		'<a href="/joinTournament?tournamentId=1&playerId=P5">/joinTournament?tournamentId=1&playerId=P5</a><Br />'+
		'<a href="/joinTournament?tournamentId=1&playerId=P1&backerId=P2&backerId=P3&backerId=P4">/joinTournament?tournamentId=1&playerId=P1&backerId=P2&backerId=P3&backerId=P4</a><Br /><Br />'+
		'<hr />' +
		'<a href="/balance?playerId=P1">/balance?playerId=P1</a><br />'+
		'<a href="/balance?playerId=P2">/balance?playerId=P2</a><br />'+
		'<a href="/balance?playerId=P3">/balance?playerId=P3</a><br />'+
		'<a href="/balance?playerId=P4">/balance?playerId=P4</a><br />'+
		'<a href="/balance?playerId=P5">/balance?playerId=P5</a><br />'+

		'<form action="/resultTournament" enctype="application/json" method="POST">'+
		'	<input type="hidden" name="tournamentId" value="1" />' +
		'	<input type="hidden" name="winners[0][playerID]" value="P1" />' +
		'	<input type="hidden" name="winners[0][prize]" value="2000" />' +
		'	<input type="submit" value="/resultTournament [post]" />'+
		'</form><br /><br /><br />'+
			
		'<a href="/reset">/reset database</a><br />';



	html += 'Available tournaments: <br />';
	sql.query("SELECT * FROM opt_tournaments ORDER BY id DESC", function(err, data) {		

		for( var i=0;i<data.length;i++ ) {
			html += '[ID: '+data[i].id+']: '+data[i].name+', Minimum Deposit: '+data[i].minDeposit+'<br />';
		}

		res.send(html);
	});

});

app.get('/reset', function (req, res) {
	var query;
	
	query = "TRUNCATE opt_backer_to_player";
	sql.query(query);

	query = "TRUNCATE opt_players";
	sql.query(query);

	query = "TRUNCATE opt_player_to_tournament";
	sql.query(query);

	query = "TRUNCATE opt_tournaments";
	sql.query(query);


	res.redirect(req.get('referer'));
});

app.get('/take', function (req, res) {

	takeFunds({
		playerID: req.query.playerId,
		points	: req.query.points
	}, function(success, message) {
			if( !success ) {
				console.log(message);
				res.status(500);
			} else {
				res.status(200);
			}
			res.send('');

	});

});

app.get('/fund', function (req, res) {
	// sanitization required!
	addFunds({
		playerID: req.query.playerId,
		points	: req.query.points
	}, function(success, message) {
			if( !success ) {
				console.log(message);
				res.status(500);
			} else {
				res.status(200);
			}
			res.send('');

	});

});

app.get('/announceTournament', function (req, res) {

	// sanitization required!
	var deposit			= req.query.deposit,
		tournamentID	= req.query.tournamentId,
		message			= ''; 

	var query = "UPDATE opt_tournaments SET minDeposit='"+deposit+"', status='started' WHERE id='"+tournamentID+"'";
	sql.query(query, function(err, data) {
		if(!data.affectedRows) {
			query = "INSERT INTO opt_tournaments SET minDeposit='"+deposit+"', status='started', id='"+tournamentID+"'";
			sql.query(query);
		}
	});

	message = "[*] Tournament ID: "+tournamentID+" announced! Deposit: "+deposit;

	res.status(201);
	res.send('');
	console.log(message);


});

// ja nepietiek līdzekļi, jāskatās vai ir backeri. Ja ir backeri, tad jāpārbauda vai visiem kopā pietiek piķis. Jāņem no visiem vienādas daļas. Ko darīt ar 333.33(3) ?
app.get('/joinTournament', function (req, res) {
	// sanitization required!
	var tournamentID	= req.query.tournamentId,
		playerID		= req.query.playerId,
		backerID		= req.query.backerId,
		message			= '',
		backers			= []; 

	if( typeof backerID != 'undefined' && typeof backerID == 'string' )
		backers.push(backerID);
	else if( typeof backerID != 'undefined' ) {
		backers = backerID;
	}

	joinTournament({
			playerID	: playerID,
			tournamentID: tournamentID,
			backers		: backers
		}, function(success, data) {
			if( typeof data != 'undefined' )
				console.log(data);
		}
	);

	res.send('');

});


function joinTournament( params, callback ) {
	var params = params || {};

	if ( typeof params.playerID == 'undefined' || typeof params.tournamentID == 'undefined' ) {
		callback(false);
		return false;
	}

	// check if player exists
	var query = "SELECT id, playerID, points FROM opt_players WHERE playerID='"+params.playerID+"'";

	sql.query(query, function(err, playerData) {
		
		if(!playerData) {
			callback(false, {error: 1});
			return false;
		} else {

			query = "SELECT minDeposit, status FROM opt_tournaments WHERE id='"+params.tournamentID+"'";
			sql.query(query, function(err, tournamentData) {

				if(!tournamentData) {
					console.log('[-] No tournament with ID: '+params.tournamentID+'! ');
					callback(false, {error: 2});
					return false;
				} else {

					if( tournamentData[0].status != 'started' ) {
						console.log('[-] Tournament ID: '+params.tournamentID+' has not been announced yet!');
						callback(false, {error: 3});
						return false;
					}

					if( tournamentData[0].minDeposit > playerData[0].points ) {
						console.log('[-] Player ID: '+params.playerID+' has insufficient funds to join tournament ID: '+params.tournamentID+' !');

						if( !params.backers.length ) {
							callback(false, {error: 4});
							return false;
						} else {

							var tGroupJoinCount		= 1 + params.backers.length,
								tGroupParticipantShare	= tournamentData[0].minDeposit / tGroupJoinCount,
								participantCapitalCheck = true;

							console.log('[+] Player ID: '+params.playerID+' backed by: '+params.backers.join(',')+'. Verifying...');

							if( playerData[0].points < tGroupParticipantShare ) {
								console.log('[-] Player ID: '+playerData[0].playerID+' has insufficient funds to join tournament ID: '+params.tournamentID+' !');
								callback(false, { error: 6 } );
								return false;
							}

							query = "SELECT id, playerID, points FROM opt_players WHERE playerID IN (\""+params.backers.join('","')+"\")";

							sql.query(query, function(err, chkBackerData) {

								for( var i=0; i<chkBackerData.length;i++ ) {
									if( chkBackerData[i].points < tGroupParticipantShare ) {
										console.log('[-] Player/Backer ID: '+chkBackerData[i].playerID+' has insufficient funds to back player ID: '+params.playerID+' to join tournament ID: '+params.tournamentID+' !');
										callback(false, { error: 7 } );
										return false;
										break;
									}
								}

								params['points'] = tGroupParticipantShare;

								takeFunds( params, function(success, message) {
									if( success ) {

										query = "INSERT INTO opt_player_to_tournament SET tournamentID='"+params.tournamentID+"', playerID='"+params.playerID+"', amount='"+params.points+"'";
										sql.query(query, function(err){ 
											console.log("[+] Player ID: "+params.playerID+" joined tournament ID: "+params.tournamentID+" with backers: "+params.backers.join(','));
											callback(true);
										});

									} else {
										console.log( message );
										callback(false, { error: 8 } );
										return false;
									}
								});

								for( var j=0; j<chkBackerData.length;j++ ) {

									chkBackerData[j].points = tGroupParticipantShare;
									var backerData = chkBackerData[j];

									takeFunds( backerData, function(success, message) {
										if( success ) {

											query = "INSERT INTO opt_player_to_tournament SET tournamentID='"+params.tournamentID+"', playerID='"+this.backerData.playerID+"', amount='"+this.backerData.points+"'";
											sql.query(query, function(err){ 

												console.log("[+] Player/Backer ID: "+this.backerData.playerID+" joined tournament ID: "+params.tournamentID+ " backing Player ID: "+params.playerID);
												callback(true);
											}.bind( { backerData: this.backerData }));
											
											query = "INSERT INTO opt_backer_to_player SET playerID='"+params.playerID+"', backerID='"+this.backerData.playerID+"', tournamentID='"+params.tournamentID+"'";
											sql.query(query);

										} else {
											console.log( message );
											callback(false, { error: 6 } );
											return false;
										}
									}.bind( { backerData: backerData } ));
								};



							});
							//console.log( params.backers );
						}
					} else {

						query = "SELECT 1 FROM opt_player_to_tournament WHERE tournamentID='"+params.tournamentID+"' AND playerID='"+params.playerID+"'";
						sql.query(query, function(err, chkData) { 
							if( chkData.length ) {
								// player already joined tournament
								callback(false, { error: 5 } );
								return false;
							} else {

								params['points'] = tournamentData[0].minDeposit;

								takeFunds( params, function(success, message) {
									if( success ) {

										query = "INSERT INTO opt_player_to_tournament SET tournamentID='"+params.tournamentID+"', playerID='"+params.playerID+"', amount='"+params.points+"'";
										sql.query(query, function(err){ 
											console.log("[+] Player ID: "+params.playerID+" joined tournament ID: "+params.tournamentID);
											callback(true, 'Ok');
										});

									} else {
										console.log( message );
										callback(false, { error: 6 } );
										return false;
									}
								});
							}
						});

					}
					
				}

			});
			
		}
	});

}

app.post('/resultTournament', function (req, res) {	

	var tournamentID		= req.body.tournamentId,
		winners				= req.body.winners,
		prizePretendents,
		prizeAmountEach;

	if( tournamentID ) {

		var query = "SELECT 1 FROM opt_tournaments WHERE id='"+tournamentID+"' AND status='started'";
		sql.query(query, function(err, tournamentData) {

			if( tournamentData.length ) {
				for( var j=0;j<winners.length;j++ ) {

					prizePretendents	= 1;
					prizeAmountEach		= winners[j].prize;

					console.log("[*] Announce Results tournament ID: "+tournamentID+". WINNER ID: "+winners[j].playerID+" as Winner, +"+prizeAmountEach+" points.");
					console.log("[+] Calculating results Tournament ID: "+tournamentID);

					var query = "SELECT playerID FROM opt_player_to_tournament WHERE playerID='"+winners[j].playerID+"' AND tournamentID='"+tournamentID+"'";			
					sql.query(query, function(err, participantData) { 



						console.log("[+] Winner ID: "+participantData[0].playerID+". Total amount won: "+this.prizeAmountEach);
						console.log("[+] Chekcing for backers...");

						query = "SELECT backerID FROM opt_backer_to_player WHERE playerID='"+participantData[0].playerID+"' AND tournamentID='"+tournamentID+"'";

						sql.query(query, function(err, backerData) { 

							prizePretendents = this.prizePretendents;
							prizePretendents += backerData.length;
							console.log("[+] Total Backers found: "+backerData.length);

							if( backerData.length ) {
								
								prizeAmountEach = this.prizeAmountEach / prizePretendents;

								for( var i=0;i<backerData.length;i++ ) {

									addFunds({
										playerID: backerData[i].backerID,
										points	: prizeAmountEach
									}, function(success, message){});

								}

							}
							addFunds({
								playerID: participantData[0].playerID,
								points	: prizeAmountEach
							}, function(success, message){
								console.log("[+] Done.");

								query = "UPDATE opt_tournaments SET status='' WHERE id='"+tournamentID+"'";
								sql.query(query);

								query = "DELETE FROM opt_player_to_tournament WHERE tournamentID='"+tournamentID+"'";
								sql.query(query);

								query = "DELETE FROM opt_backer_to_player WHERE tournamentID='"+tournamentID+"' AND playerID='"+participantData[0].playerID+"'";
								sql.query(query);

							});

							console.log("[+] Paying out. Stopping tournament. Wiping participants!");

						}.bind({ prizeAmountEach: this.prizeAmountEach, prizePretendents: this.prizePretendents }));

					}.bind({ prizeAmountEach: prizeAmountEach, prizePretendents: prizePretendents }));
				}
			} else {
				console.log( "[-] Tournament ID: "+tournamentID+" not announced! Exitting." );
				return;
			}
		});



		res.send('');


	}
	
});

app.get('/balance', function (req, res) {

	var playerID = req.query.playerId;

	var query = "SELECT id, playerID, points FROM opt_players WHERE playerID='"+playerID+"'";
	sql.query(query, function(err, balanceData) { 
		res.send(balanceData[0]);
	});

});


function takeFunds( params, callback ) {
	var params = params || {};

	if ( typeof params.playerID == 'undefined' || typeof params.points == 'undefined' ) {
		return false;
	}

	var playerID	= params.playerID,
		points		= params.points,
		message		= '';

	var query		= "SELECT id, playerID, points FROM opt_players WHERE playerID='"+playerID+"'";

	sql.query(query, function(err, data) {
		if(!err) {

			if( !data.length ) {
				console.log("[+] No such player ID: "+playerID);
				callback(false, 'Error');
				return false;
			} else {

				if( data[0].points < points ) {
					callback(false, '[-] Player ID: '+playerID+' does not have '+points+' funds');
					return false;
				} else {
					query = "UPDATE opt_players SET points=points-"+points+" WHERE playerID='"+playerID+"'";
					sql.query(query);
				}
			}						

			console.log("[+] Taking "+points+" points from Player ID: "+playerID);
			callback(true, 'Ok');
			return true


		} else {
			message = '[-] SQL error in /fund! '+err;
			callback(false, message);
			return false;
		}
	});


}


function addFunds( params, callback ) {
	var params = params || {};

	if ( typeof params.playerID == 'undefined' || typeof params.points == 'undefined' ) {
		console.log( "[-] addFunds Error! ");
		console.log( params );
		console.log( "[-] ------------------------------------ ");
		return false;
	}

	var playerID	= params.playerID,
		points		= params.points,
		message		= '';

	var query		= "SELECT id, playerID, points FROM opt_players WHERE playerID='"+playerID+"'";

	sql.query(query, function(err, data) {
		if(!err) {

			if( !data.length ) {
				console.log("[+] Created New Player ID: "+playerID);
				query = "INSERT INTO opt_players SET playerID='"+playerID+"', points='"+points+"'";
			} else {
				query = "UPDATE opt_players SET points=points+"+points+" WHERE playerID='"+playerID+"'";
			}

			sql.query(query);
			console.log("[+] Adding "+points+" points to Player ID: "+playerID);

			callback(true, 'Ok');


		} else {
			message = '[-] SQL error in /fund! '+err;
			callback(false, message);
		}
	});


}

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);

