var round = new Round( 2 , "?" );
var pnlDeclare = document.getElementById( "pnlDeclare" );
var pnlBottom = document.getElementById( "pnlBottom" );
var pnlPlay = document.getElementById( "pnlPlay" );

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
	else if ( round.roundData.starter = "W" ) {
		hand = round.handW;
	}
	
	for ( var i=0 ; i<8 ; ++i ) {
		hand.addCard( round.bottom.get( i ) );
	}
	
	for ( var i=0 ; i<hand.size() ; ++i ) {
		hand.get( i ).setSelected( false );
	}
	
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
			playerEntireHand.removeAt( i );
			--i;
		}
	}
	round.showPlayedCards( playerIdxToName( playerIdx ) , handPlayed );
	
	if ( trick == undefined ) {
		trick = new Trick( round.roundData.level , round.roundData.declared , 
									handPlayed , playerIdxToName( playerIdx ) );
	}
	else {
		trick.setCardsPlayed( playerIdxToName( playerIdx ) , handPlayed );
	}
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
	playSelectedCards( aiIdx , ai.data.hand );
}

//the next person to play some cards in the trick
var currIdx = -1;

function beginPlay() {
	document.getElementById( "cmdNextTrick" ).setAttribute( 
												"class" , "commandDisabled" );
	var starter = round.roundData.starter;
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
			document.getElementById( "cmdNextTrick" ).setAttribute( 
													"class" , "command" );
		}
	}
	round.renderDeclaredHands();
}

function playSelected() {
	document.getElementById( "cmdPlayTrick" ).setAttribute( 
												"class" , "commandDisabled" );
	playSelectedCards( 0 , round.handS );
	++currIdx;
	if ( trick.finished() ) {
		document.getElementById( "cmdNextTrick" ).setAttribute( 
														"class" , "command" );
	}
	else {
		play();
	}
}

function startNextTrick() {
	if ( trick.finished() ) {
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
