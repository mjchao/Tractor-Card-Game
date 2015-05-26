TrickTypes = {
		
	//DUMP: A group of cards with no particular "type". It generally consists of
	//multiple singles, pairs, and/or tractors. The cards in a DUMP must be 
	//the highest in their suit, or else the DUMP is not valid
	DUMP : 0 ,
	
	//SINGLE: 1 card
	SINGLE : 1 ,
	
	//PAIR: 2 cards of the same suit and value
	PAIR : 2 ,
	
	//TRACTOR: 2 or more consecutive pairs
	TRACTOR: 3
}

function isSingle( hand ) {
	return hand.size() == 1;
}

function isPair( hand ) {
	return hand.size() == 2 && 
		hand.get( 0 ).value == hand.get( 1 ).value && 
		hand.get( 0 ).suit == hand.get( 1 ).suit;
}

/**
 * Checks if the given hand is a tractor.
 * 
 * @param hand
 * @param level
 * @param trumpSuit
 * @returns {Boolean}
 */
function isTractor( hand , level , trumpSuit ) {
	
	hand = hand.deepClone();
	hand.hand.sort( 
		new CardComparatorForHandsDeclared( level , trumpSuit ).compare );
	
	//since tractors are consecutive pairs, we must have an even number of cards
	if ( hand.size() % 2 != 0 ) {
		return false;
	}
	
	//tractors must have at least four cards
	if ( hand.size() < 4 ) {
		return false;
	}
	
	var isTrump = false;
	if ( hand.get( 0 ).suit > 4 || hand.get( 0 ).suit == trumpSuit || 
			hand.get( 0 ).value == level ) {
		isTrump = true;
	}
	
	//check that everything is of the same suit
	if ( !isTrump ) {
		for ( var i=0 ; i<hand.size()-1 ; ++i ) {
			if ( hand.get( i ).suit != hand.get( i+1 ).suit ) {
				return false;
			}
		}
	}
	else {
		
		//trump suit has to allow for jokers and dominant cards
		for ( var i=0 ; i<hand.size() ; ++i ) {
			if ( hand.get( i ).suit != trumpSuit && 
					hand.get( i ) < 4 && 
					hand.get( i ).value != level ) {
				return false;
			}
		}
	}
	
	//check that we only have pairs
	for ( var i=0 ; i<hand.size() ; i+=2 ) {
		if ( hand.get( i ).value != hand.get( i+1 ).value || 
				hand.get( i ).suit != hand.get( i+1 ).suit ) {
			return false;
		}
	}

	//check that pairs are consecutive
	for ( var i=1 ; i+1<hand.size() ; i+=2 ) {
		var ok = false;
		var pair1 = hand.get( i );
		var pair2 = hand.get( i+1 );
		
		//ace-king is consecutive
		if ( pair1.value == 1 && pair2.value == 12 ) {
			ok = true;
		}
		
		if ( pair1.value - pair2.value == 1 &&
				/*Can't use dominant cards*/
				pair1.value != level && pair2.value != level &&
				/*Can't use ace with 2*/
				pair1.value != 1 && pair2.value != 1 ) {
			ok = true;
		}
		
		//tractor consecutivity can "jump" over the dominant card value
		if ( pair1.value - pair2.value == 2 && 
				((pair1.value + pair2.value)/2) == level ) {
			ok = true;
		}
		
		//in the case that this is trump, some other consecutives are valid
		if ( isTrump ) {
			
			//big joker + small joker are consecutive
			if ( pair1.suit == 6 && pair2.suit == 5 ) {
				ok = true;
			}
			
			//small joker + dominant card of trump suit are consecutive
			if ( pair1.suit == 5 && 
					((pair2.value == level && pair2.suit == trumpSuit) ||
					 (pair2.value == level && trumpSuit > 4 )) ) {
				ok = true;
			}
			
			//dominant card of trump suit + dominant card of non-trump suit
			//are consecutive
			if ( pair1.value == level && pair1.suit == trumpSuit && 
					pair2.value == level && pair2.suit != trumpSuit ) {
				ok = true;
			}
			
			//dominant card of non-trump suit + ace of trump suit are
			//consecutive
			if ( pair1.value == level && pair1.suit != trumpSuit && 
					pair2.value == 1 ) {
				ok = true;
			}
		}
		
		if ( !ok ) {
			console.log( i );
			return false;
		}
	}
	return true;
}

function removeATractor( hand ) {
	
}

function DumpData( hand ) {
	
}

function Trick( firstHand ) {
	
}

//Unit Tests:
//Reminder: constructor for Card is Card( suit , value ) not
//Card( value , suit )
function assert( condition , message ) {
	if ( !condition ) {
		throw message || "assertion failed :(";
	}
}
var testHand = new Hand();

//test pair
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
assert( isPair( testHand , 2 , 2 ) );

testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 3 ) );
assert( !isPair( testHand , 2 , 2 ) );

testHand.clear();
testHand.addCard( new Card( 3 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
assert( !isPair( testHand , 2 , 2 ) );

testHand.clear();
testHand.addCard( new Card( 5 , 0 ) );
testHand.addCard( new Card( 6 , 0 ) );
assert( !isPair( testHand , 2 , 2 ) );

testHand.clear();
testHand.addCard( new Card( 5 , 0 ) );
testHand.addCard( new Card( 5 , 0 ) );
assert( isPair( testHand , 2 , 2 ) );

/* TRACTOR TESTS
//test normal tractor 2-2-3-3 of non-trump
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 3 ) );
assert( isTractor( testHand , 10 , 3 ) );

//test normal tractor A-A-K-K of non-trump
testHand.clear();
testHand.addCard( new Card( 2 , 1 ) );
testHand.addCard( new Card( 2 , 1 ) );
testHand.addCard( new Card( 2 , 12 ) );
testHand.addCard( new Card( 2 , 12 ) );
assert( isTractor( testHand , 10 , 3 ) );

//test bad tractor A-A-2-2 of non-trump
testHand.clear();
testHand.addCard( new Card( 2 , 1 ) );
testHand.addCard( new Card( 2 , 1 ) );
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
assert( !isTractor( testHand , 10 , 3 ) );

//test another normal tractor of non-trump
testHand.clear();
testHand.addCard( new Card( 1 , 5 ) );
testHand.addCard( new Card( 1 , 5 ) );
testHand.addCard( new Card( 1 , 6 ) );
testHand.addCard( new Card( 1 , 6 ) );
assert( isTractor( testHand , 10 , 3 ) );

//test tractor jumping over dominant card value
testHand.clear();
testHand.addCard( new Card( 2 , 9 ) );
testHand.addCard( new Card( 2 , 9 ) );
testHand.addCard( new Card( 2 , 11 ) );
testHand.addCard( new Card( 2 , 11 ) );
assert( isTractor( testHand , 10 , 3 ) );


//test bad tractor 10-10-J-J where 10s are dominant cards
testHand.clear();
testHand.addCard( new Card( 1 , 10 ) );
testHand.addCard( new Card( 1 , 10 ) );
testHand.addCard( new Card( 1 , 11 ) );
testHand.addCard( new Card( 1 , 11 ) );
assert( !isTractor( testHand , 10 , 3 ) );

//test bad tractor spread across different suits
testHand.clear();
testHand.addCard( new Card( 2 , 1 ) );
testHand.addCard( new Card( 2 , 1 ) );
testHand.addCard( new Card( 1 , 2 ) );
testHand.addCard( new Card( 1 , 2 ) );
assert( !isTractor( testHand , 10 , 3 ) );

//test bad tractor that lacks pairs
testHand.clear();
testHand.addCard( new Card( 2 , 1 ) );
testHand.addCard( new Card( 2 , 1 ) );
testHand.addCard( new Card( 2 , 2 ) );
assert( !isTractor( testHand , 10 , 3 ) );

//test triple tractor
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 4 ) );
assert( isTractor( testHand , 10 , 3 ) );

//test triple tractor jumping over dominant card level
testHand.clear();
testHand.addCard( new Card( 2 , 9 ) );
testHand.addCard( new Card( 2 , 9 ) );
testHand.addCard( new Card( 2 , 11 ) );
testHand.addCard( new Card( 2 , 11 ) );
testHand.addCard( new Card( 2 , 12 ) );
testHand.addCard( new Card( 2 , 12 ) );
assert( isTractor( testHand , 10 , 3 ) );

//test bad triple tractor
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 5 ) );
assert( !isTractor( testHand , 10 , 3 ) );

//test trump ace + non-trump-suit dominant card
testHand.clear();
testHand.addCard( new Card( 2 , 1 ) );
testHand.addCard( new Card( 2 , 1 ) );
testHand.addCard( new Card( 3 , 2 ) );
testHand.addCard( new Card( 3 , 2 ) );
assert( isTractor( testHand , 2 , 2 ) );

//test dominant card trump tractor
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 3 , 2 ) );
testHand.addCard( new Card( 3 , 2 ) );
assert( isTractor( testHand , 2 , 3 ) );

//test tractors with jokers
testHand.clear();
testHand.addCard( new Card( 3 , 2 ) );
testHand.addCard( new Card( 3 , 2 ) );
testHand.addCard( new Card( 5 , 0 ) );
testHand.addCard( new Card( 5 , 0 ) );
assert( isTractor( testHand , 2 , 3 ) );

//test tractors with jokers
testHand.clear();
testHand.addCard( new Card( 5 , 0 ) );
testHand.addCard( new Card( 5 , 0 ) );
testHand.addCard( new Card( 6 , 0 ) );
testHand.addCard( new Card( 6 , 0 ) );
assert( isTractor( testHand , 2 , 0 ) );

//test no-trump dominant-card + small joker tractors
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 5 , 0 ) );
testHand.addCard( new Card( 5 , 0 ) );
assert( isTractor( testHand , 2 , 5 ) );

//test no-trump dominant-card + small joker tractors
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 6 , 0 ) );
testHand.addCard( new Card( 6 , 0 ) );
assert( !isTractor( testHand , 2 , 5 ) );
//*/

