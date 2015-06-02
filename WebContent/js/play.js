var nsLevel = 2;
var ewLevel = 2;
var round = new Round( 2 , "?" );
var pnlDeclare = document.getElementById( "pnlDeclare" );
var pnlBottom = document.getElementById( "pnlBottom" );
var pnlPlay = document.getElementById( "pnlPlay" );
var pnlNextRound = document.getElementById( "pnlNextRound" );

function checkAIDeclare( ai , player , hand ) {

	while( round.canDeclare( player , 1 ) ) {
		if ( ai.wantFlipDiamonds( round ) ) {
			round.tryDeclare( player , 1 );
		}
		else {
			break;
		}
	}
	
	while( round.canDeclare( player , 2 ) ) {
		if ( ai.wantFlipClubs( round ) ) {
			round.tryDeclare( player , 2 );
		}
		else {
			break;
		}
	}
	
	while( round.canDeclare( player , 3 ) ) {
		if ( ai.wantFlipHearts( round ) ) {
			round.tryDeclare( player , 3 );
		}
		else {
			break;
		}
	}
	
	while( round.canDeclare( player , 4 ) ) {
		if ( ai.wantFlipSpades( round ) ) {
			round.tryDeclare( player , 4 );
		}
		else {
			break;
		}
	}
	
	//6 comes before 5 b/c by default, AI will not want to show both
	//little and big jokers if AI has them all
	while( round.canDeclare( player , 6 ) ) {
		if ( ai.wantFlipNoTrump( round ) ) {
			round.tryDeclare( player , 6 );
		}
		else {
			break;
		}
	}
	
	while( round.canDeclare( player , 5 ) ) {
		if ( ai.wantFlipNoTrump( round ) ) {
			round.tryDeclare( player , 5 );
		}
		else {
			break;
		}
	}
}

function checkAIsDeclare() {
	checkAIDeclare( westAI , "W" , westAI.data.hand );
	checkAIDeclare( northAI , "N" , northAI.data.hand );
	checkAIDeclare( eastAI , "E" , eastAI.data.hand );
}

function deal() {
	round.deal();
	
	checkAIsDeclare();
	
	if ( round.dealer.finished() ) {
		
		document.getElementById( "cmdDeal" ).setAttribute( 
												"class" , "declareDisabled" );
		
		//deal one more time to render the declared offsets of the cards
		//in reality, no additional cards will be dealt
		round.deal();
		
		if ( round.roundData.isDeclared() ) {
			processDealingComplete();
		}
		else {
			document.getElementById( "cmdFlipBottom" ).style.visibility = 
				"visible";
		}
	}
}

/**
 * Flips the bottom for determining the trump suit because nobody has declared.
 */
function flipBottom() {
	var lastShownIdx = 0;
	var cardToReveal = round.bottom.get( 0 );
	var highCard = cardToReveal;
	highCard.setSelected( true );
	do {
		cardToReveal = round.bottom.get( lastShownIdx );
		cardToReveal.setVisible( true );
		
		if ( cardToReveal.compareToByValue( highCard ) > 0 ||
				cardToReveal.value == round.roundData.level ) {
			highCard.setSelected( false );
			cardToReveal.setSelected( true );
			highCard = cardToReveal;
		}
		
		++lastShownIdx;
		
	} while( cardToReveal.value != round.roundData.level && lastShownIdx < 8 );
	
	round.roundData.declared = highCard.suit;
	
	var hand = new Hand();
	for ( var i=0 ; i<8 ; ++i ) {
		hand.addCard( round.bottom.get( i ) );
	}
	hand.renderOffsets();
	
	for ( var i=0 ; i<lastShownIdx ; ++i ) {
		round.bottom.get( i ).setVisible( true );
	}
	for ( var i=lastShownIdx ; i<8 ; ++i ) {
		round.bottom.get( i ).setVisible( false );
	}
	
	var pnlCenter = document.getElementById( "pnlCenter" );
	pnlCenter.innerHTML = "";
	var dispC = new HandDisplay( hand , "C" );
	dispC.renderCenter( pnlCenter );
	
	round.renderDeclaredHands();
	
	processDealingComplete();
}

function addBottomToHand() {
	var hand;
	
	if ( round.roundData.starter == "N" ) {
		hand = round.handN;
	}
	else if ( round.roundData.starter == "S" ) {
		hand = round.handS;
	}
	else if ( round.roundData.starter == "E" ) {
		hand = round.handE;
	}
	else if ( round.roundData.starter == "W" ) {
		hand = round.handW;
	}
	else {
		console.log( round.roundData.starter );
	}
	
	for ( var i=0 ; i<8 ; ++i ) {
		hand.addCard( round.bottom.get( i ) );
	}
	
	for ( var i=0 ; i<hand.size() ; ++i ) {
		hand.get( i ).setSelected( false );
	}
	
	round.bottom.clear();
	
	round.renderDeclaredHands();
}

function showBottomCommands() {
	round.returnDeclaredCards();
	addBottomToHand();
	
	//have to clear the center panel if the bottom was previously shown there
	document.getElementById( "pnlCenter" ).innerHTML = "";
	
	if ( round.dealer.finished() && round.roundData.isDeclared() ) {
		document.getElementById( "cmdFlipBottomNext" ).style.visibility = 
			"hidden";
		if ( round.roundData.starter == "S" ) {
			pnlBottom.style.visibility = "visible";
		}
		else {
			pnlPlay.style.visibility = "visible";
			processBottom();
		}
	}
}

/**
 * Shows the correct buttons corresponding to when dealing (handing out cards
 * and declaring the trump suit) is complete.
 */
function processDealingComplete() {
	pnlDeclare.style.visibility = "hidden";
	document.getElementById( "cmdFlipBottom" ).style.visibility = 
		"hidden";
	document.getElementById( "cmdFlipBottomNext" ).style.visibility = 
		"visible";
	updateRoundStats();
}


/**
 * Removes 8 cards from the hand of the player who received the bottom. If it is
 * an AI, the cards are removed automatically. If it is the user, the user
 * must select 8 cards to remove.
 */
function processBottom() {
	var hand;
	if ( round.roundData.starter == "S" ) {
		hand = round.handS;
	}
	else {
		ai = getAIByName( round.roundData.starter );
		hand = ai.data.hand;
		ai.unselectAll();
		ai.makeBottom();
	}
	
	var numCardsSelected = 0;
	for ( var i=0 ; i<hand.size() ; ++i ) {
		if ( hand.get( i ).selected ) {
			++numCardsSelected;
		}
	}
	
	if ( numCardsSelected == 8 ) {
		for ( var i=0 ; i<hand.size() ; ++i ) {
			if ( hand.get( i ).selected ) {
				round.bottom.addCard( hand.get( i ) );
				hand.removeCard( hand.get( i ) );
				
				//have to decrement counter because the size of the array
				//went down by 1 when the card was removed
				--i;
			}
		}
		pnlBottom.style.visibility = "hidden";
		pnlPlay.style.visibility = "visible";
		round.renderDeclaredHands();
		
		beginPlay();
	}
	else {
		alert( "You have selected " + numCardsSelected + 
				" cards to move to the bottom. You must select exactly 8." );
	}
}

function checkDealingComplete() {
	if ( round.dealer.finished() ) {
		processDealingComplete();
	}
}

function flipSpades() {
	round.tryDeclare( "S" , 4 );
	checkDealingComplete();
}

function flipHearts() {
	round.tryDeclare( "S" , 3 );
	checkDealingComplete();
}

function flipClubs() {
	round.tryDeclare( "S" , 2 );
	checkDealingComplete();
}

function flipDiamonds() {
	round.tryDeclare( "S" , 1 );
	checkDealingComplete();
}

function flipNoTrump() {
	round.tryDeclare( "S" , 6 );
	checkDealingComplete();
	round.tryDeclare( "S" , 5 );
}

var trick = undefined;
var lastWinner = -1;
var northAI = new AI( new AIData( round.handN ) );
var eastAI = new AI( new AIData( round.handE ) );
var westAI = new AI( new AIData( round.handW ) );

function getAIByName( name ) {
	if ( name == "N" ) {
		return northAI;
	}
	else if ( name == "E" ) {
		return eastAI;
	}
	else if ( name == "W" ) {
		return westAI;
	}
	else {
		return undefined;
	}
}

function playerIdxToName( idx ) {
	if ( idx == 0 ) {
		return "S";
	}
	else if ( idx == 1 ) {
		return "W";
	}
	else if ( idx == 2 ) {
		return "N";
	}
	else if ( idx == 3 ) {
		return "E";
	}
	return "?";
}

function playerNameToIdx( name ) {
	if ( name == "N" ) {
		return 2;
	}
	else if ( name == "S" ) {
		return 0;
	}
	else if ( name == "E" ) {
		return 3;
	}
	else if ( name == "W" ) {
		return 1;
	}
	return -1;
}

/**
 * Plays the selected cards in the given player's hand
 * 
 * @param playerIdx the index of the player (0-3)
 * @param playerEntireHand the entire hand of the player who is playing some
 * cards. the selected cards will be filtered out by this function
 */
function playSelectedCards( playerIdx , playerEntireHand ) {
	var handPlayed = new Hand( true , true );
	
	if ( playerIdx == 1 || playerIdx == 3 ) {
		handPlayed = new Hand( false , true );
	}
	for ( var i=0 ; i<playerEntireHand.size() ; ++i ) {
		if ( playerEntireHand.get( i ).selected ) {
			handPlayed.addCard( playerEntireHand.get( i ) );
		}
	}
	
	//check that the hand played is valid
	if ( trick != undefined && !trick.finished() && 
			trick.canHandFollow( playerEntireHand ) && 
			!trick.canHandFollow( handPlayed ) ) {
		
		//TODO more informative error messages
		if ( playerIdx == 0 ) {
			alert( "The hand played is invalid." );
		}
		else {
			throw "AI played invalid hand. \n" +
					"Played: " + handPlayed.toString() + "\n" +
					"Hand: " + playerEntireHand.toString();
		}
		return false ;
	}
	
	if ( trick == undefined ) {
		trick = new Trick( round.roundData.level , round.roundData.declared , 
									handPlayed , playerIdxToName( playerIdx ) );
		if ( trick.type == TrickTypes.DUMP ) {
			var initialSize = handPlayed.size();
			
			if ( handPlayed.size() == initialSize && playerIdx != 2 ) {
				handPlayed = canDump( handPlayed , round.handN , 
							round.roundData.level , round.roundData.declared );
			}
			if ( handPlayed.size() == initialSize && playerIdx != 0 ) {
				handPlayed = canDump( handPlayed , round.handS , 
							round.roundData.level , round.roundData.declared );
			}
			if ( handPlayed.size() == initialSize && playerIdx != 3 ) {
				handPlayed = canDump( handPlayed , round.handE , 
							round.roundData.level , round.roundData.declared );
			}
			if ( handPlayed.size() == initialSize && playerIdx != 1 ) {
				handPlayed = canDump( handPlayed , round.handW , 
							round.roundData.level , round.roundData.declared );
			}
			
			if ( initialSize != handPlayed.size() ) {
				console.log( "DUMP was bad" );
			}
			
			playerEntireHand.unselectAll();	
			for ( var i=0 ; i<handPlayed.size() ; ++i ) {
				for ( var j=0 ; j<playerEntireHand.size() ; ++j ) {
					if ( handPlayed.get( i ) == playerEntireHand.get( j ) && 
										!playerEntireHand.get( j ).selected ) {
						playerEntireHand.get( j ).setSelected( true );
						playerEntireHand.get( j ).setVisible( true );
					}
				}
			}
			
			handPlayed.visible = true;
			handPlayed.verticalCards = (playerIdx == 1 || playerIdx == 3) ? false : true;
			
			trick = new Trick( round.roundData.level , round.roundData.declared, 
					handPlayed , playerIdxToName( playerIdx ) );
		}
		
		
		for ( var i=0 ; i<playerEntireHand.size() ; ++i ) {
			if ( playerEntireHand.get( i ).selected ) {
				playerEntireHand.removeAt( i );
				--i;
			}
		}
		round.showPlayedCards( playerIdxToName( playerIdx ) , handPlayed );
		
		
	}
	else {
		
		for ( var i=0 ; i<playerEntireHand.size() ; ++i ) {
			if ( playerEntireHand.get( i ).selected ) {
				playerEntireHand.removeAt( i );
				--i;
			}
		}
		round.showPlayedCards( playerIdxToName( playerIdx ) , handPlayed );
		
		trick.setCardsPlayed( playerIdxToName( playerIdx ) , handPlayed );
	}
	return true;
}

function aiMakeMove( aiIdx ) {
	var ai = undefined;
	if ( aiIdx == 1 ) {
		ai = westAI;
	}
	else if ( aiIdx == 2 ) {
		ai = northAI;
	}
	else if ( aiIdx == 3 ) {
		ai = eastAI;
	}
	if ( trick == undefined ) {
		ai.lead();
	}
	else {
		ai.play( round , trick );
	}
	console.log( "AI " + aiIdx + "makes move" );
	return playSelectedCards( aiIdx , ai.data.hand );
}

//the next person to play some cards in the trick
var currIdx = -1;

function beginPlay() {
	document.getElementById( "cmdNextTrick" ).setAttribute( 
												"class" , "commandDisabled" );
	var starter = round.roundData.starter;
	console.log( starter );
	if ( starter == "N" ) {
		currIdx = 2;
	}
	else if ( starter == "S" ) {
		currIdx = 0;
	}
	else if ( starter == "E" ) {
		currIdx = 3;
	}
	else if ( starter == "W" ) {
		currIdx = 1;
	}
	play();
}

function play() {
	var aiPlayed = false;
	while( currIdx != 0 && (trick == undefined || !trick.finished()) ) {
		aiMakeMove( currIdx );
		aiPlayed = true;
		currIdx = ( currIdx + 1 ) % 4;
	}
	if ( trick == undefined || trick.finished() ) {
		if ( aiPlayed ) {
			if ( round.handS.size() > 0 ) {
				document.getElementById( "cmdNextTrick" ).setAttribute( 
														"class" , "command" );
			}
			else {
				document.getElementById( "pnlPlay" ).style.visibility = "hidden";
				document.getElementById( 
								"pnlNextRound" ).style.visibility = "visible";
				document.getElementById( "cmdNextRound" ).setAttribute( 
												"class" , "commandDisabled" );
			}
		}
	}
	round.renderDeclaredHands();
}

function playSelected() {
	if ( document.getElementById( "cmdPlayTrick" ).getAttribute( 
													"class" ) == "command" ) {
		var success = playSelectedCards( 0 , round.handS );
		if ( success ) {
			++currIdx;
			if ( trick.finished() ) {
				if ( round.handS.size() > 0 ) {
					document.getElementById( "cmdNextTrick" ).setAttribute( 
														"class" , "command" );
				}
				else {
					document.getElementById( "pnlPlay" ).style.visibility = "hidden";
					document.getElementById( 
								"pnlNextRound" ).style.visibility = "visible";
					document.getElementById( "cmdNextRound" ).setAttribute( 
												"class" , "commandDisabled" );
				}
			}
			else {
				play();
			}
			document.getElementById( "cmdPlayTrick" ).setAttribute( 
												"class" , "commandDisabled" );
		}
	}
}

function scoreTrick() {
	var defenders = "??";
	if ( round.starter == "N" || round.starter == "S" ) {
		defenders = "NS";
	}
	else if ( round.starter == "E" || round.starter == "W" ) {
		defenders = "EW";
	}
	
	if ( defenders.indexOf( trick.determineWinner() ) == -1 ) {
		var trickPoints = trick.countPoints();
		round.roundData.points += trickPoints;
		document.getElementById( "txtPoints" ).innerHTML = "Points: " + 
														round.roundData.points;
	}
	
}

function startNextTrick() {
	if ( trick.finished() ) {
		
		//reset cards so that they are all unselected.
		round.handN.unselectAll();
		round.handS.unselectAll();
		round.handE.unselectAll();
		round.handW.unselectAll();
		
		scoreTrick();
		document.getElementById( "cmdNextTrick" ).setAttribute( 
				"class" , "commandDisabled" );
		document.getElementById( "cmdPlayTrick" ).setAttribute( 
						"class" , "command" );
		document.getElementById( "pnlCenter" ).innerHTML = "";
		lastWinner = trick.determineWinner();
		var idx = playerNameToIdx( lastWinner );
		currIdx = idx;
		trick = undefined;
		play();
	}
}

function revealBottom() {
	if ( document.getElementById( "cmdViewBottom" ).getAttribute( 
											"class" ) == "commandDisabled" ) {
		return;
	}
	round.showBottom();
	scoreBottom();
}

function scoreBottom() {
	var defenders = "??";
	if ( round.starter == "N" || round.starter == "S" ) {
		defenders = "NS";
	}
	else if ( round.starter == "E" || round.starter == "W" ) {
		defenders = "EW";
	}
	
	if ( defenders.indexOf( trick.determineWinner() ) == -1 ) {
		var pointsInBottom = 0;
		for ( var i=0 ; i<round.bottom.size() ; ++i ) {
			if ( round.bottom.get( i ).value == 5 ) {
				pointsInBottom += 5;
			}
			else if ( round.bottom.get( i ).value == 10 || 
										round.bottom.get( i ).value == 13 ) {
				pointsInBottom += 10;
			}
		}
		alert( "Attackers won the bottom and received " + pointsInBottom + 
				" x2 = " + (2*pointsInBottom) + " additional points. " + 
				"Final attacker score: " + 
				(round.roundData.points + pointsInBottom*2)  );
	}
	else {
		alert( "Defenders defended bottom. Final attacker score: " + 
													round.roundData.points );
	}
	document.getElementById( "txtPoints" ).innerHTML = "Points: " + 
														round.roundData.points;
	document.getElementById( "cmdViewBottom" ).setAttribute( 
												"class" , "commandDisabled" );
	document.getElementById( "cmdNextRound" ).setAttribute( 
														"class" , "command" );
}

function startNextRound() {
	if ( document.getElementById( 
					"cmdNextRound" ).getAttribute( "class" ) == "command" ) {
		var defenders = "??";
		if ( round.starter == "N" || round.starter == "S" ) {
			defenders = "NS";
		}
		else if ( round.starter == "E" || round.starter == "W" ) {
			defenders = "EW";
		}
		
		if ( round.roundData.points > 80 ) {
			var extraLevels = Math.floor( (round.roundData.points - 80)/40 );
			if ( defenders = "NS" ) {
				ewLevel += extraLevels;
				var nextStarter;
				if ( round.roundData.starter == "N" ) {
					nextStarter = "E";
				}
				else {
					nextStarter = "W";
				}
				round = new Round( ewLevel , nextStarter );
			}
			else if ( defenders == "EW" ) {
				nsLevel += extraLevels;
				var nextStarter;
				if ( round.roundData.starter == "E" ) {
					nextStarter = "S";
				}
				else {
					nextStarter = "N";
				}
				round = new Round( nsLevel , nextStarter );
			}
		}
		else {
			var extraLevels = Math.floor( (80 - round.roundData.points)/40 );

			var nextStarter;
			if ( round.roundData.starter == "N" ) {
				nextStarter = "S";
			}
			else if ( round.roundData.starter == "S" ) {
				nextStarter = "N";
			}
			else if ( round.roundData.starter == "E" ) {
				nextStarter = "E";
			}
			else if ( round.roundData.starter == "W" ) {
				nextStarter = "W";
			}
			
			if ( defenders == "NS" ) {
				nsLevel += extraLevels;
				round = new Round( nsLevel , nextStarter );
			}
			else if ( defenders == "EW" ) {
				ewLevel += extraLevels;
				round = new Round( ewLevel , nextStarter );
			}
		}
		
		updateRoundStats();
		pnlNextRound.style.visibility = "hidden";
		pnlBottom.style.visibility = "hidden";
		pnlPlay.style.visibility = "hidden";
		pnlDeclare.style.visbility = "visible";
		document.getElementById( "cmdSpades" ).style.visibility = "visible";
		document.getElementById( "cmdHearts" ).style.visibility = "visible";
		document.getElementById( "cmdClubs" ).style.visibility = "visible";
		document.getElementById( "cmdDiamonds" ).style.visibility = "visible";
		document.getElementById( "cmdNoTrump" ).style.visibility = "visible";
		document.getElementById( "cmdDeal" ).style.visibility = "visible";
		document.getElementById( "cmdFlipBottom" ).style.visibility = "visible";
		document.getElementById( "cmdFlipBottomNext" ).style.visibility = "visible";
	}
}

function updateRoundStats() {
	document.getElementById( "txtLevelNS" ).setAttribute( "class" , "" );
	document.getElementById( "txtLevelEW" ).setAttribute( "class" , "" );
	document.getElementById( "txtNorth" ).setAttribute( "class" , "" );
	document.getElementById( "txtSouth" ).setAttribute( "class" , "" );
	document.getElementById( "txtEast" ).setAttribute( "class" , "" );
	document.getElementById( "txtWest" ).setAttribute( "class" , "" );
	document.getElementById( "lvlNS" ).innerHTML = nsLevel;
	document.getElementById( "lvlEW" ).innerHTML = ewLevel;
	document.getElementById( "txtPoints" ).innerHTML = "Points: 0";
	var defenders = "??";
	if ( round.starter == "N" || round.starter == "S" ) {
		defenders = "NS";
	}
	else if ( round.starter == "E" || round.starter == "W" ) {
		defenders = "EW";
	}
	if ( defenders == "NS" ) {
		document.getElementById( "txtLevelNS" ).setAttribute( 
														"class" , "defender" );
	}
	else if ( defenders == "EW" ) {
		document.getElementById( "txtLevelEW" ).setAttribute( 
														"class" , "defender" );
	}
	if ( round.starter == "N" ) {
		document.getElementById( "txtNorth" ).setAttribute( "class" , "leader" );
	}
	else if ( round.starter == "S" ) {
		document.getElementById( "txtSouth" ).setAttribute( "class" , "leader" );
	}
	else if ( round.starter == "E" ) {
		document.getElementById( "txtEast" ).setAttribute( "class" , "leader" );
	}
	else if ( round.starter == "W" ) {
		document.getElementById( "txtWest" ).setAttribute( "class" , "leader" );
	}
}

document.getElementById( "cmdDeal" ).onclick = deal;
document.getElementById( "cmdSpades" ).onclick = flipSpades;
document.getElementById( "cmdHearts" ).onclick = flipHearts;
document.getElementById( "cmdClubs" ).onclick = flipClubs;
document.getElementById( "cmdDiamonds" ).onclick = flipDiamonds;
document.getElementById( "cmdNoTrump" ).onclick = flipNoTrump;
document.getElementById( "cmdFlipBottomNext" ).onclick = showBottomCommands;
document.getElementById( "cmdFlipBottom" ).onclick = flipBottom;
document.getElementById( "cmdBottom" ).onclick = processBottom;
document.getElementById( "cmdPlayTrick" ).onclick = playSelected;
document.getElementById( "cmdNextTrick" ).onclick = startNextTrick;
document.getElementById( "cmdViewBottom" ).onclick = revealBottom;
document.getElementById( "cmdNextRound" ).onclick = startNextRound;
