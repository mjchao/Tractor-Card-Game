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
		if ( pair1.value == 1 && pair2.value == 13 ) {
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
			return false;
		}
	}
	return true;
}

function removeSingleFrom( hand ) {
	var rtn = new Hand();
	for ( var i=0 ; i<hand.size() ; ++i ) {
		if ( isSingle( hand.subhand( i , i+1 ) ) ) {
			rtn.addCard( hand.get( i ) );
			hand.removeAt( i );
			return rtn;
		}
	}
	return rtn;
}

function removePairFrom( hand ) {
	var rtn = new Hand();
	for ( var i=0 ; i<hand.size()-1 ; ++i ) {
		if ( isPair( hand.subhand( i , i+2 ) ) ) {
			rtn.addCard( hand.get( i ) );
			hand.removeAt( i );
			rtn.addCard( hand.get( i ) );
			hand.removeAt( i );
			return rtn;
		}
	}
	return rtn;
}

function removeTractorFrom( hand , level , trumpSuit ) {
	var rtn = new Hand();
	for ( var length=24 ; length >= 4 ; length -= 2 ) {
		for ( var start=0 ; start+length <= hand.size() ; ++start ) {
			if ( isTractor( hand.subhand( start , start+length , 
													level , trumpSuit ) ) ) {
				for ( var i=0 ; i<length ; ++i ) {
					rtn.addCard( hand.get( start ) );
					hand.removeAt( start );
				}
				return rtn;
			}
		}
	}
	return rtn;
}

function removeTractorLengthFrom( hand , length , level , trumpSuit ) {
	var rtn = new Hand();
	for ( var start=0 ; start+length <= hand.size() ; ++start ) {
		if ( isTractor( hand.subhand( start , start+length ) , 
														level , trumpSuit ) ) {
			for ( var i=0 ; i<length ; ++i ) {
				rtn.addCard( hand.get( start ) );
				hand.removeAt( start );
			}
			return rtn;
		}
	}
	return rtn;
}

function Trick( level , trumpSuit , firstHand , leader ) {
	
	this.level = level;
	this.trumpSuit = trumpSuit;
	this.firstHand = firstHand;
	this.leader = leader;
	
	//the cards the north, south, east, and west played
	//South = index 0 , West = index 1 , North = index 2 , East = index 3
	//this maintains the counter-clockwise order
	this.hands = [ undefined , undefined , undefined , undefined ];
	
	this.setCardsPlayed = function( player , cardsPlayed ) {
		var idx = -1;
		if ( player == "N" ) {
			idx = 2;
		}
		else if ( player == "S" ) {
			idx = 0;
		}
		else if ( player == "E" ) {
			idx = 3;
		}
		else if ( player == "W" ) {
			idx = 1;
		}
		this.hands[ idx ] = cardsPlayed.clone();
		this.hands[ idx ].hand.sort( 
			new CardComparatorForHandsDeclared( level , trumpSuit ).compare);
	}
	
	this.setCardsPlayed( leader , firstHand );
	
	if ( firstHand.get( 0 ).suit == 6 || 
			firstHand.get( 0 ).suit == 5 || 
			firstHand.get( 0 ).value == level ) {
		this.suit = trumpSuit;
	}
	else {
		this.suit = firstHand.get( 0 ).suit;
	}
	
	if ( isTractor( firstHand , level , trumpSuit ) ) {
		this.type = TrickTypes.TRACTOR;
	}
	else if ( isPair( firstHand ) ) {
		this.type = TrickTypes.PAIR;
	}
	else if ( isSingle( firstHand ) ) {
		this.type = TrickTypes.SINGLE;
	}
	else {
		this.type = TrickTypes.DUMP;
	}
	
	/**
	 * Determines if the given hand can follow the trick type.
	 * 
	 * @param hand the player's hand 
	 */
	this.canHandFollow = function( hand ) {
		//only consider the cards of the correct suit
		var subhand = new Hand();
		for ( var i=0 ; i<hand.size() ; ++i ) {
			if ( this.suit == this.trumpSuit ) {
				if ( hand.get( i ).suit == this.suit || 
						hand.get( i ).suit > 4 || 
						hand.get( i ).value == this.level ) {
					subhand.addCard( hand.get( i ) );
				}
			}
			else {
				if ( hand.get( i ).suit == this.suit ) {
					subhand.addCard( hand.get( i ) );
				}
			}
		}
		if ( this.type == TrickTypes.TRACTOR ) {
			var tractorLength = this.firstHand.size();
			return removeTractorFrom( subhand.clone() , 
					this.level , this.trumpSuit ).size() >= tractorLength;
		}
		else if ( this.type == TrickTypes.PAIR ) {
			return removePairFrom( subhand.clone() ).size() == 2;
		}
		else if ( this.type == TrickTypes.SINGLE ) {
			return removeSingleFrom( subhand.clone() ).size() == 1;
		}
		else {
			var firstHandClone = this.firstHand.clone();
			
			//see if the player's hand can offer the same size tractors
			//as the leading hand
			var qtyRemoved = removeTractorFrom( firstHandClone , 
										this.level , this.trumpSuit ).size();
			while( qtyRemoved > 0 ){
				if ( removeTractorLengthFrom( 
						subhand , qtyRemoved ).size() == 0 ) {
					return false;
				}	
				qtyRemoved = removeTractorFrom( firstHandClone , 
									this.level , this.trumpSuit ).size();
			}
			
			//see if the player's hand can offer the same number of pairs
			//as the leading hand
			qtyRemoved = removePairFrom( firstHandClone ).size();
			while( qtyRemoved > 0 ) {
				if ( removePairFrom( subhand ).size() == 0 ) {
					return false;
				}
				qtyRemoved = removePairFrom( firstHandClone ).size();
			}
			
			//see if player's hand can offer the same number of single cards
			//as the leading hand
			qtyRemoved = removeSingleFrom( firstHandClone ).size();
			while( qtyRemoved > 0 ) {
				if ( removeSingleFrom( subhand ).size() == 0 ) {
					return false;
				}
				qtyRemoved = removeSingleFrom( firstHandClone ).size();
			}
		}
		return true;
	}
	
	this.playerNameToIdx = function( playerName ) {
		if ( playerName == "N" ) {
			return 2;
		}
		else if ( playerName == "S" ) {
			return 0;
		}
		else if ( playerName == "E" ) {
			return 3;
		}
		else if ( playerName == "W" ) {
			return 1;
		}
		return -1;
	}
	
	this.playerIdxToName = function( playerIdx ) {
		if ( playerIdx == 0 ) {
			return "S";
		}
		else if ( playerIdx == 1 ) {
			return "W";
		}
		else if ( playerIdx == 2 ) {
			return "N";
		}
		else if ( playerIdx == 3 ) {
			return "E";
		}
		return "?";
	}
	
	this.isTrump = function( card ) {
		if ( card.suit == this.trumpSuit ) {
			return true;
		}
		if ( card.suit > 4 ) {
			return true;
		}
		if ( card.value == this.level ) {
			return true;
		}
		return false;
	}
	
	/**
	 * Determines who wins this trick. Only works if the trick is valid! All
	 * hands played must be correct. For example, this assumes that everyone
	 * played the same number of cards and that the number of cards played by
	 * each person is positive.
	 * 
	 * Furthermore, all hands must already be sorted in the same, consistent
	 * order (highest to lowest). This will not be a problem if you do not
	 * change the order in which cards were placed in hands by the dealing
	 * functions.
	 */
	this.determineWinner = function() {
		var leaderIdx = this.playerNameToIdx( this.leader );
		var winner = leaderIdx;
		var winningHand = this.firstHand;
		
		if ( this.type == TrickTypes.SINGLE ) {
			
			//start with whomever comes after the leader and continue comparing
			//hands in counter-clockwise order until we reach the leader again
			for ( var i = (leaderIdx+1) % 4 ; i != leaderIdx ; i = (i+1) % 4 ) {
				var handToConsider = this.hands[ i ];
				var cardPlayed = handToConsider.get( 0 );
				var winningCard = winningHand.get( 0 );
				if ( this.isTrump( cardPlayed ) || 
										cardPlayed.suit == winningCard.suit ) {
					if ( cardPlayed.compareToByDeclared( winningCard , 
										this.level , this.trumpSuit ) > 0 ) {
						winningHand = handToConsider;
						winner = i;
					}
				}
			}
		}
		else if ( this.type == TrickTypes.PAIR ) {
			for ( var i = (leaderIdx+1) % 4 ; i != leaderIdx ; i = (i+1) % 4 ) {
				var handToConsider = this.hands[ i ];
				
				if ( isPair( handToConsider ) ) {
					var pairCard = handToConsider.get( 0 );
					var winningPairCard = winningHand.get( 0 );
					if ( this.isTrump( pairCard ) || 
									pairCard.suit == winningPairCard.suit ) {
						if ( pairCard.compareToByDeclared( winningPairCard , 
										this.level , this.trumpSuit ) > 0 ) {
							winningHand = handToConsider;
							winner = i;
						}
					}
				}
			}
		}
		else if ( this.type == TrickTypes.TRACTOR ) {
			for ( var i = (leaderIdx+1) % 4 ; i != leaderIdx ; i = (i+1) % 4 ) {
				var handToConsider = this.hands[ i ];
				
				if ( isTractor( handToConsider , this.level ,
															this.trumpSuit) ) {
					var tractorCard = handToConsider.get( 0 );
					var winningCard = winningHand.get( 0 );
					if ( this.isTrump( tractorCard ) || 
							tractorCard.suit == winningCard.suit ) {
						if ( tractorCard.compareToByDeclared( winningCard , 
										this.level , this.trumpSuit ) > 0 ) {
							winningHand = handToConsider;
							winner = i;
						}
					}
				}
			}
		}
		else if ( this.type == TrickTypes.DUMP ) {
			
			//if a player has been able to dump cards, then he must have
			//the highest cards in that suit. therefore, we only care about
			//trumping. if a hand we are considering is not all trump, then
			//it cannot possibly beat the current winning hand
			
			for ( var i = (leaderIdx+1) % 4 ; i != leaderIdx ; i = (i+1) % 4 ) {
				var handToConsider = this.hands[ i ].clone();
				
				var isAllTrump = true;
				for ( var j=0 ; j<handToConsider.size() ; ++j ) {
					if ( !this.isTrump( handToConsider.get( j ) ) ) {
						isAllTrump = false;
						break;
					}
				}
				
				if ( !isAllTrump ) {
					continue;
				}
				
				//check that the hand played meets all the combination
				//requirements of the leading hand
				var firstHandCpy = this.firstHand.clone();
				var combinationsMet = true;
				
				var nextTractor = removeTractorFrom( firstHandCpy , 
												this.level , this.trumpSuit );
				while( nextTractor.size() > 0 ) {
					if ( removeTractorLengthFrom( handToConsider , 
								nextTractor.size() , this.level , 
												this.trumpSuit ).size() == 0 ) {
						
						//insufficient number of tractors => fail
						combinationsMet = false;
						break;
					}
					nextTractor = removeTractorFrom( firstHandCpy , 
												this.level , this.trumpSuit );
				}
				
				if ( combinationsMet ) {
					var nextPair = removePairFrom( firstHandCpy );
					while( nextPair.size() > 0 ) {
						if ( removePairFrom( handToConsider ).size() == 0 ) {
							
							//insufficient number of pairs => fail
							combinationsMet = false;
							break;
						}
						nextPair = removePairFrom( firstHandCpy );
					}
				}
				
				if ( combinationsMet ) {
					var nextSingle = removeSingleFrom( firstHandCpy );
					while( nextSingle.size() > 0 ) {
						if ( removeSingleFrom( handToConsider ).size() == 0 ) {
							
							//insufficient number of singles => fail
							combinationsMet = false;
							break;
						}
						nextSingle = removeSingleFrom( firstHandCpy );
					}
				}
				
				if ( !combinationsMet ) {
					continue;
				}
				
				//now that we know the hand to consider has met all combination
				//requirements, we just find the rarest combination and compare
				//the best of those, and whichever hand has the higher one wins
				
				//for example, if the leading hand had a tractor, whichever hand
				//has the higher tractor wins - all other combinations are
				//disregarded
				
				//if the leading hand had no tractors, but it had a pair, then
				//whichever hand has the highest pair wins - all singles are 
				//disregarded
				firstHandCpy = this.firstHand.clone();
				var winningHandCpy = winningHand.clone();
				handToConsider = this.hands[ i ].clone();
				
				nextTractor = removeTractorFrom( firstHandCpy , 
												this.level , this.trumpSuit );
				if ( nextTractor.size() > 0 ) {
					var bestWinningTractor = removeTractorLengthFrom( 
									winningHandCpy , nextTractor.size() , 
												this.level , this.trumpSuit);
					var bestConsideredTractor = removeTractorLengthFrom( 
									handToConsider , nextTractor.size() , 
												this.level , this.trumpSuit );
					
					if ( bestConsideredTractor.get( 0 ).compareToByDeclared( 
							bestWinningTractor.get( 0 ) , this.level , 
													this.trumpSuit ) > 0 ) {
						winningHand = this.hands[ i ];
						winner = i;
					}
					continue;
				}
				
				nextPair = removePairFrom( firstHandCpy );
				if ( nextPair.size() > 0 ) {
					var bestWinningPair = removePairFrom( winningHandCpy );
					var winningPairCard = bestWinningPair.get( 0 );
					var bestConsideredPair = removePairFrom( handToConsider );
					var consideredPairCard = bestConsideredPair.get( 0 );
					
					if ( consideredPairCard.compareToByDeclared( 
											winningPairCard , this.level , 
														this.trumpSuit ) > 0 ) {
						winningHand = this.hands[ i ];
						winner = i;
					}
					continue;
				}
				
				//if this code is reached, then the dump was all singles, so
				//we just compare the highest card in each hand
				var bestWinningCard = winningHandCpy.get( 0 );
				var bestConsideredCard = handToConsider.get( 0 );
				if ( bestConsideredCard.compareToByDeclared( bestWinningCard , 
										this.level , this.trumpSuit ) > 0 ) {
					winningHand = this.hands[ i ];
					winner = i;
				}
			}
		}
		
		return this.playerIdxToName( winner );
	}
	return -1;
}

/*
//Unit Tests:
//Reminder: constructor for Card is Card( suit , value ) not
//Card( value , suit )
function assert( condition , message ) {
	if ( !condition ) {
		throw message || "assertion failed :(";
	}
}


var testHand = new Hand();

//PAIR TESTS
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

//TRACTOR TESTS
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
testHand.addCard( new Card( 2 , 13 ) );
testHand.addCard( new Card( 2 , 13 ) );
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

//CAN FOLLOW tests
var testFirstHand = new Hand();
var testTrick;


//test triple tractor
testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 2 ) );
testFirstHand.addCard( new Card( 2 , 2 ) );
testFirstHand.addCard( new Card( 2 , 3 ) );
testFirstHand.addCard( new Card( 2 , 3 ) );
testFirstHand.addCard( new Card( 2 , 4 ) );
testFirstHand.addCard( new Card( 2 , 4 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 6 ) );
testHand.addCard( new Card( 2 , 6 ) );
testHand.addCard( new Card( 2 , 7 ) );
testHand.addCard( new Card( 2 , 7 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( testTrick.canHandFollow( testHand ) );

//test double tractor
testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 2 ) );
testFirstHand.addCard( new Card( 2 , 2 ) );
testFirstHand.addCard( new Card( 2 , 3 ) );
testFirstHand.addCard( new Card( 2 , 3 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 6 ) );
testHand.addCard( new Card( 2 , 6 ) );
testHand.addCard( new Card( 2 , 7 ) );
testHand.addCard( new Card( 2 , 7 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( testTrick.canHandFollow( testHand ) );

//test cannot follow triple tractor - only have a double tractor
testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 2 ) );
testFirstHand.addCard( new Card( 2 , 2 ) );
testFirstHand.addCard( new Card( 2 , 3 ) );
testFirstHand.addCard( new Card( 2 , 3 ) );
testFirstHand.addCard( new Card( 2 , 4 ) );
testFirstHand.addCard( new Card( 2 , 4 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 6 ) );
testHand.addCard( new Card( 2 , 6 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( !testTrick.canHandFollow( testHand ) );

//test following with two tractors
testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testFirstHand.addCard( new Card( 2 , 1 ) );
testFirstHand.addCard( new Card( 2 , 1 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 6 ) );
testHand.addCard( new Card( 2 , 6 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( testTrick.canHandFollow( testHand ) );

//test following with two tractors of different sizes
testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 7 ) );
testFirstHand.addCard( new Card( 2 , 7 ) );
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testFirstHand.addCard( new Card( 2 , 1 ) );
testFirstHand.addCard( new Card( 2 , 1 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 6 ) );
testHand.addCard( new Card( 2 , 6 ) );
testHand.addCard( new Card( 2 , 7 ) );
testHand.addCard( new Card( 2 , 7 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( testTrick.canHandFollow( testHand ) );

//test 2 tractors, but your hand has a length-4 tractor
testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testFirstHand.addCard( new Card( 2 , 1 ) );
testFirstHand.addCard( new Card( 2 , 1 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 5 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( testTrick.canHandFollow( testHand ) );

//test for off-suit distractions
testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testFirstHand.addCard( new Card( 2 , 1 ) );
testFirstHand.addCard( new Card( 2 , 1 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 1 , 5 ) );
testHand.addCard( new Card( 1 , 5 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( !testTrick.canHandFollow( testHand ) );

//test pairs
testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 3 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( testTrick.canHandFollow( testHand ) );

testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 4 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( testTrick.canHandFollow( testHand ) );

testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 3 , 4 ) );
testHand.addCard( new Card( 3 , 4 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( !testTrick.canHandFollow( testHand ) );


//test single+pair+tractor dump, can follow
testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testFirstHand.addCard( new Card( 2 , 1 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 5 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( testTrick.canHandFollow( testHand ) );

//test can follow: bunch of singles and a pair
testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 2 ) );
testFirstHand.addCard( new Card( 2 , 3 ) );
testFirstHand.addCard( new Card( 2 , 4 ) );
testFirstHand.addCard( new Card( 2 , 7 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testFirstHand.addCard( new Card( 2 , 1 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 5 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( testTrick.canHandFollow( testHand ) );

//test can follow: tractor and pair
testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 2 ) );
testFirstHand.addCard( new Card( 2 , 2 ) );
testFirstHand.addCard( new Card( 2 , 3 ) );
testFirstHand.addCard( new Card( 2 , 3 ) );
testFirstHand.addCard( new Card( 2 , 1 ) );
testFirstHand.addCard( new Card( 2 , 1 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 3 , 3 ) );
testHand.addCard( new Card( 2 , 11 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 5 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( !testTrick.canHandFollow( testHand ) );

//test single+pair+tractor dump, can't follow
testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testFirstHand.addCard( new Card( 2 , 12 ) );
testFirstHand.addCard( new Card( 2 , 1 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 6 ) );
testHand.addCard( new Card( 2 , 7 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( !testTrick.canHandFollow( testHand ) );

//test single+tractor dump, can't follow
testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testFirstHand.addCard( new Card( 2 , 1 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 3 , 6 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( !testTrick.canHandFollow( testHand ) );

//test just a single
testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 8 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 3 , 6 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( testTrick.canHandFollow( testHand ) );

testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 8 ) );
testHand.clear();
testHand.addCard( new Card( 1 , 4 ) );
testHand.addCard( new Card( 1 , 4 ) );
testHand.addCard( new Card( 3 , 5 ) );
testHand.addCard( new Card( 1 , 5 ) );
testHand.addCard( new Card( 4 , 6 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( !testTrick.canHandFollow( testHand ) );

//test just a pair
testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 8 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 6 ) );
testHand.addCard( new Card( 2 , 7 ) );
testHand.addCard( new Card( 3 , 8 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( !testTrick.canHandFollow( testHand ) );

testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 8 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 1 , 5 ) );
testHand.addCard( new Card( 2 , 6 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( testTrick.canHandFollow( testHand ) );

//test just a tractor
testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 6 ) );
testHand.addCard( new Card( 2 , 7 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( testTrick.canHandFollow( testHand ) );

testFirstHand.clear();
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 8 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testFirstHand.addCard( new Card( 2 , 9 ) );
testHand.clear();
testHand.addCard( new Card( 2 , 2 ) );
testHand.addCard( new Card( 2 , 3 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 4 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 5 ) );
testHand.addCard( new Card( 2 , 6 ) );
testHand.addCard( new Card( 2 , 7 ) );
testTrick = new Trick( 10 , 3 , testFirstHand );
assert( testTrick.canHandFollow( testHand ) );

//WINNER OF TRICK TESTS
var testTrick;
var nHand = new Hand();
var sHand = new Hand();
var eHand = new Hand();
var wHand = new Hand();

//test single card
nHand.clear();
nHand.addCard( new Card( 2 , 2 ) );
eHand.clear();
eHand.addCard( new Card( 2 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 2 , 3 ) );
wHand.clear();
wHand.addCard( new Card( 2 , 4 ) );

//check that the order in which the 4s are played matters - i.e. first one
//played is highest
testTrick = new Trick( 10 , 3 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "E" );

testTrick = new Trick( 10 , 3 , sHand , "S" );
testTrick.setCardsPlayed( "W" , wHand );
testTrick.setCardsPlayed( "N" , nHand );
testTrick.setCardsPlayed( "E" , eHand );
assert( testTrick.determineWinner() == "W" );

//check that the leader winning is also possible
testTrick = new Trick( 10 , 3 , wHand , "W" );
testTrick.setCardsPlayed( "N" , nHand );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
assert( testTrick.determineWinner() == "W" );

//check that this accounts for trumps
testTrick = new Trick( 2 , 3 , eHand , "E" );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
testTrick.setCardsPlayed( "N" , nHand );
assert( testTrick.determineWinner() == "N" );

//more checking that trumps are accounted for
nHand.clear();
nHand.addCard( new Card( 1 , 2 ) );
eHand.clear();
eHand.addCard( new Card( 2 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 3 , 3 ) );
wHand.clear();
wHand.addCard( new Card( 3 , 1 ) );

testTrick = new Trick( 2 , 3 , eHand , "E" );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
testTrick.setCardsPlayed( "N" , nHand );
assert( testTrick.determineWinner() == "N" );

//also check for non-trump discards
testTrick = new Trick( 10 , 4 , eHand , "E" );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
testTrick.setCardsPlayed( "N" , nHand );
assert( testTrick.determineWinner() == "E" );

//test for jokers
nHand.clear();
nHand.addCard( new Card( 5 , 0 ) );
eHand.clear();
eHand.addCard( new Card( 2 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 3 , 3 ) );
wHand.clear();
wHand.addCard( new Card( 3 , 1 ) );
testTrick = new Trick( 10 , 4 , eHand , "E" );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
testTrick.setCardsPlayed( "N" , nHand );
assert( testTrick.determineWinner() == "N" );

nHand.clear();
nHand.addCard( new Card( 5 , 0 ) );
eHand.clear();
eHand.addCard( new Card( 2 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 3 , 3 ) );
wHand.clear();
wHand.addCard( new Card( 6 , 0 ) );
testTrick = new Trick( 10 , 4 , eHand , "E" );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
testTrick.setCardsPlayed( "N" , nHand );
assert( testTrick.determineWinner() == "W" );


//test pairs

//test discards
nHand.clear();
nHand.addCard( new Card( 1 , 2 ) );
nHand.addCard( new Card( 1 , 2 ) );
eHand.clear();
eHand.addCard( new Card( 2 , 4 ) );
eHand.addCard( new Card( 2 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 3 , 3 ) );
sHand.addCard( new Card( 3 , 3 ) );
wHand.clear();
wHand.addCard( new Card( 3 , 1 ) );
wHand.addCard( new Card( 3 , 1 ) );
testTrick = new Trick( 10 , 4 , wHand , "W" );
testTrick.setCardsPlayed( "N" , nHand );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
assert( testTrick.determineWinner() == "W" );

//test trumped
nHand.clear();
nHand.addCard( new Card( 1 , 2 ) );
nHand.addCard( new Card( 1 , 2 ) );
eHand.clear();
eHand.addCard( new Card( 2 , 4 ) );
eHand.addCard( new Card( 2 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 3 , 3 ) );
sHand.addCard( new Card( 3 , 3 ) );
wHand.clear();
wHand.addCard( new Card( 3 , 1 ) );
wHand.addCard( new Card( 3 , 1 ) );
testTrick = new Trick( 1 , 3 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "W" );

nHand.clear();
nHand.addCard( new Card( 1 , 2 ) );
nHand.addCard( new Card( 1 , 2 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 4 ) );
eHand.addCard( new Card( 1 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 1 , 3 ) );
sHand.addCard( new Card( 1 , 10 ) );
wHand.clear();
wHand.addCard( new Card( 3 , 2 ) );
wHand.addCard( new Card( 3 , 2 ) );
testTrick = new Trick( 10 , 3 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "W" );

//test West's trump failed because it is not a pair
nHand.clear();
nHand.addCard( new Card( 1 , 2 ) );
nHand.addCard( new Card( 1 , 2 ) );
eHand.clear();
eHand.addCard( new Card( 2 , 4 ) );
eHand.addCard( new Card( 2 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 3 , 3 ) );
sHand.addCard( new Card( 3 , 3 ) );
wHand.clear();
wHand.addCard( new Card( 3 , 1 ) );
wHand.addCard( new Card( 3 , 2 ) );
testTrick = new Trick( 1 , 3 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "S" );

//test all trumps failed since they are not pairs
nHand.clear();
nHand.addCard( new Card( 1 , 2 ) );
nHand.addCard( new Card( 1 , 2 ) );
eHand.clear();
eHand.addCard( new Card( 2 , 4 ) );
eHand.addCard( new Card( 2 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 3 , 3 ) );
sHand.addCard( new Card( 3 , 10 ) );
wHand.clear();
wHand.addCard( new Card( 3 , 1 ) );
wHand.addCard( new Card( 3 , 2 ) );
testTrick = new Trick( 1 , 3 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "N" );

//test winning trick with same-suit pair
nHand.clear();
nHand.addCard( new Card( 1 , 2 ) );
nHand.addCard( new Card( 1 , 2 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 4 ) );
eHand.addCard( new Card( 1 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 1 , 3 ) );
sHand.addCard( new Card( 1 , 10 ) );
wHand.clear();
wHand.addCard( new Card( 3 , 2 ) );
wHand.addCard( new Card( 3 , 2 ) );
testTrick = new Trick( 2 , 3 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "W" );

nHand.clear();
nHand.addCard( new Card( 1 , 2 ) );
nHand.addCard( new Card( 1 , 2 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 4 ) );
eHand.addCard( new Card( 1 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 1 , 3 ) );
sHand.addCard( new Card( 1 , 10 ) );
wHand.clear();
wHand.addCard( new Card( 3 , 2 ) );
wHand.addCard( new Card( 3 , 2 ) );
testTrick = new Trick( 1 , 2 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "E" );

//test winning with jokers
nHand.clear();
nHand.addCard( new Card( 1 , 2 ) );
nHand.addCard( new Card( 1 , 2 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 4 ) );
eHand.addCard( new Card( 1 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 5 , 0 ) );
sHand.addCard( new Card( 5 , 0 ) );
wHand.clear();
wHand.addCard( new Card( 6 , 0 ) );
wHand.addCard( new Card( 6 , 0 ) );
testTrick = new Trick( 10 , 5 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "W" );

nHand.clear();
nHand.addCard( new Card( 1 , 2 ) );
nHand.addCard( new Card( 1 , 2 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 4 ) );
eHand.addCard( new Card( 1 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 5 , 0 ) );
sHand.addCard( new Card( 6 , 0 ) );
wHand.clear();
wHand.addCard( new Card( 6 , 0 ) );
wHand.addCard( new Card( 5 , 0 ) );
testTrick = new Trick( 10 , 5 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "E" );

//test tractors
nHand.clear();
nHand.addCard( new Card( 1 , 2 ) );
nHand.addCard( new Card( 1 , 2 ) );
nHand.addCard( new Card( 1 , 3 ) );
nHand.addCard( new Card( 1 , 3 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 4 ) );
eHand.addCard( new Card( 1 , 4 ) );
eHand.addCard( new Card( 1 , 5 ) );
eHand.addCard( new Card( 1 , 5 ) );
sHand.clear();
sHand.addCard( new Card( 1 , 10 ) );
sHand.addCard( new Card( 1 , 10 ) ); //note: 10 is trump since level is 10!
sHand.addCard( new Card( 1 , 11 ) );
sHand.addCard( new Card( 1 , 11 ) );
wHand.clear();
wHand.addCard( new Card( 1 , 11 ) );
wHand.addCard( new Card( 1 , 12 ) );
wHand.addCard( new Card( 1 , 12 ) );
wHand.addCard( new Card( 1 , 13 ) );
testTrick = new Trick( 10 , 5 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "E" );

nHand.clear();
nHand.addCard( new Card( 1 , 2 ) );
nHand.addCard( new Card( 1 , 2 ) );
nHand.addCard( new Card( 1 , 3 ) );
nHand.addCard( new Card( 1 , 3 ) );
nHand.addCard( new Card( 1 , 4 ) );
nHand.addCard( new Card( 1 , 4 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 8 ) );
eHand.addCard( new Card( 1 , 8 ) );
eHand.addCard( new Card( 1 , 9 ) );
eHand.addCard( new Card( 1 , 9 ) );
eHand.addCard( new Card( 1 , 11 ) );
eHand.addCard( new Card( 1 , 11 ) );
sHand.clear();
sHand.addCard( new Card( 1 , 1 ) );
sHand.addCard( new Card( 1 , 1 ) );
sHand.addCard( new Card( 2 , 2 ) );
sHand.addCard( new Card( 2 , 3 ) );
sHand.addCard( new Card( 2 , 4 ) );
sHand.addCard( new Card( 2 , 7 ) );
wHand.clear();
wHand.addCard( new Card( 1 , 12 ) );
wHand.addCard( new Card( 1 , 12 ) );
wHand.addCard( new Card( 1 , 13 ) );
wHand.addCard( new Card( 1 , 13 ) );
wHand.addCard( new Card( 2 , 1 ) );
wHand.addCard( new Card( 2 , 1 ) );
testTrick = new Trick( 10 , 5 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "E" );

//test big tractor gets trumped
nHand.clear();
nHand.addCard( new Card( 1 , 2 ) );
nHand.addCard( new Card( 1 , 2 ) );
nHand.addCard( new Card( 1 , 3 ) );
nHand.addCard( new Card( 1 , 3 ) );
nHand.addCard( new Card( 1 , 4 ) );
nHand.addCard( new Card( 1 , 4 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 8 ) );
eHand.addCard( new Card( 1 , 8 ) );
eHand.addCard( new Card( 1 , 9 ) );
eHand.addCard( new Card( 1 , 9 ) );
eHand.addCard( new Card( 1 , 11 ) );
eHand.addCard( new Card( 1 , 11 ) );
sHand.clear();
sHand.addCard( new Card( 3 , 12 ) );
sHand.addCard( new Card( 3 , 12 ) );
sHand.addCard( new Card( 3 , 1 ) );
sHand.addCard( new Card( 3 , 1 ) );
sHand.addCard( new Card( 2 , 10 ) );
sHand.addCard( new Card( 2 , 10 ) );
wHand.clear();
wHand.addCard( new Card( 3 , 10 ) );
wHand.addCard( new Card( 3 , 10 ) );
wHand.addCard( new Card( 5 , 0 ) );
wHand.addCard( new Card( 5 , 0 ) );
wHand.addCard( new Card( 6 , 0 ) );
wHand.addCard( new Card( 6 , 0 ) );
testTrick = new Trick( 10 , 3 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "W" );

//test tractor is unopposed
nHand.clear();
nHand.addCard( new Card( 1 , 2 ) );
nHand.addCard( new Card( 1 , 2 ) );
nHand.addCard( new Card( 1 , 3 ) );
nHand.addCard( new Card( 1 , 3 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 8 ) );
eHand.addCard( new Card( 1 , 9 ) );
eHand.addCard( new Card( 1 , 11 ) );
eHand.addCard( new Card( 1 , 12 ) );
sHand.clear();
sHand.addCard( new Card( 3 , 12 ) );
sHand.addCard( new Card( 3 , 12 ) );
sHand.addCard( new Card( 3 , 1 ) );
sHand.addCard( new Card( 3 , 1 ) );
wHand.clear();
wHand.addCard( new Card( 3 , 10 ) );
wHand.addCard( new Card( 3 , 10 ) );
wHand.addCard( new Card( 5 , 0 ) );
wHand.addCard( new Card( 5 , 0 ) );
testTrick = new Trick( 10 , 4 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "N" );

//test dumps: note that in each test case, the dumper has the highest
//cards in his/her suit, because otherwise, the dump would not be permitted

//dumping three singles... checking that 1 (ace) > 2
nHand.clear();
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 13 ) );
nHand.addCard( new Card( 1 , 12 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 2 ) );
eHand.addCard( new Card( 1 , 3 ) );
eHand.addCard( new Card( 1 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 3 , 12 ) );
sHand.addCard( new Card( 3 , 12 ) );
sHand.addCard( new Card( 3 , 1 ) );
wHand.clear();
wHand.addCard( new Card( 3 , 10 ) );
wHand.addCard( new Card( 3 , 10 ) );
wHand.addCard( new Card( 5 , 0 ) );
testTrick = new Trick( 5 , 4 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "N" );

//trumping three singles
nHand.clear();
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 13 ) );
nHand.addCard( new Card( 1 , 12 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 2 ) );
eHand.addCard( new Card( 1 , 3 ) );
eHand.addCard( new Card( 1 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 3 , 12 ) );
sHand.addCard( new Card( 3 , 12 ) );
sHand.addCard( new Card( 3 , 1 ) );
wHand.clear();
wHand.addCard( new Card( 3 , 10 ) );
wHand.addCard( new Card( 3 , 10 ) );
wHand.addCard( new Card( 5 , 0 ) );
testTrick = new Trick( 10 , 4 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "W" );


//dumping a single and a pair
nHand.clear();
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 13 ) );
nHand.addCard( new Card( 1 , 13 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 12 ) );
eHand.addCard( new Card( 1 , 12 ) );
eHand.addCard( new Card( 1 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 1 , 9 ) );
sHand.addCard( new Card( 1 , 10 ) );
sHand.addCard( new Card( 1 , 11 ) );
wHand.clear();
wHand.addCard( new Card( 1 , 3 ) );
wHand.addCard( new Card( 1 , 4 ) );
wHand.addCard( new Card( 1 , 7 ) );
testTrick = new Trick( 2 , 4 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "N" );

//trumping a single and a pair
nHand.clear();
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 13 ) );
nHand.addCard( new Card( 1 , 13 ) );
eHand.clear();
eHand.addCard( new Card( 4 , 2 ) );
eHand.addCard( new Card( 4 , 2 ) );
eHand.addCard( new Card( 4 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 4 , 5 ) );
sHand.addCard( new Card( 4 , 5 ) );
sHand.addCard( new Card( 4 , 7 ) );
wHand.clear();
wHand.addCard( new Card( 4 , 10 ) );
wHand.addCard( new Card( 4 , 10 ) );
wHand.addCard( new Card( 5 , 0 ) );
testTrick = new Trick( 10 , 4 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "W" );

//unable to trump single and a pair
nHand.clear();
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 13 ) );
nHand.addCard( new Card( 1 , 13 ) );
eHand.clear();
eHand.addCard( new Card( 4 , 2 ) );
eHand.addCard( new Card( 4 , 3 ) );
eHand.addCard( new Card( 4 , 4 ) );
sHand.clear();
sHand.addCard( new Card( 4 , 5 ) );
sHand.addCard( new Card( 4 , 6 ) );
sHand.addCard( new Card( 4 , 7 ) );
wHand.clear();
wHand.addCard( new Card( 4 , 10 ) );
wHand.addCard( new Card( 4 , 11 ) );
wHand.addCard( new Card( 5 , 0 ) );
testTrick = new Trick( 10 , 4 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "N" );

//dumping tractor and a pair
nHand.clear();
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 13 ) );
nHand.addCard( new Card( 1 , 13 ) );
nHand.addCard( new Card( 1 , 11 ) );
nHand.addCard( new Card( 1 , 11 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 2 ) );
eHand.addCard( new Card( 1 , 3 ) );
eHand.addCard( new Card( 1 , 4 ) );
eHand.addCard( new Card( 2 , 2 ) );
eHand.addCard( new Card( 2 , 3 ) );
eHand.addCard( new Card( 2 , 7 ) );
sHand.clear();
sHand.addCard( new Card( 1 , 5 ) );
sHand.addCard( new Card( 1 , 6 ) );
sHand.addCard( new Card( 1 , 7 ) );
sHand.addCard( new Card( 3 , 2 ) );
sHand.addCard( new Card( 3 , 3 ) );
sHand.addCard( new Card( 2 , 4 ) );
wHand.clear();
wHand.addCard( new Card( 4 , 10 ) );
wHand.addCard( new Card( 4 , 10 ) );
wHand.addCard( new Card( 4 , 2 ) );
wHand.addCard( new Card( 4 , 3 ) );
wHand.addCard( new Card( 4 , 4 ) );
wHand.addCard( new Card( 4 , 5 ) );
testTrick = new Trick( 10 , 4 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "N" );

//trumping tractor and pair
nHand.clear();
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 13 ) );
nHand.addCard( new Card( 1 , 13 ) );
nHand.addCard( new Card( 1 , 11 ) );
nHand.addCard( new Card( 1 , 11 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 2 ) );
eHand.addCard( new Card( 1 , 3 ) );
eHand.addCard( new Card( 1 , 4 ) );
eHand.addCard( new Card( 2 , 2 ) );
eHand.addCard( new Card( 2 , 3 ) );
eHand.addCard( new Card( 2 , 7 ) );
sHand.clear();
sHand.addCard( new Card( 4 , 3 ) );
sHand.addCard( new Card( 4 , 3 ) );
sHand.addCard( new Card( 4 , 5 ) );
sHand.addCard( new Card( 4 , 5 ) );
sHand.addCard( new Card( 4 , 6 ) );
sHand.addCard( new Card( 4 , 6 ) );
wHand.clear();
wHand.addCard( new Card( 4 , 2 ) );
wHand.addCard( new Card( 4 , 2 ) );
wHand.addCard( new Card( 4 , 7 ) );
wHand.addCard( new Card( 4 , 7 ) );
wHand.addCard( new Card( 4 , 8 ) );
wHand.addCard( new Card( 4 , 8 ) );
testTrick = new Trick( 10 , 4 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "W" );

//trumping tractor and pair unsuccessfully
nHand.clear();
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 13 ) );
nHand.addCard( new Card( 1 , 13 ) );
nHand.addCard( new Card( 1 , 11 ) );
nHand.addCard( new Card( 1 , 11 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 2 ) );
eHand.addCard( new Card( 1 , 3 ) );
eHand.addCard( new Card( 1 , 4 ) );
eHand.addCard( new Card( 2 , 2 ) );
eHand.addCard( new Card( 2 , 3 ) );
eHand.addCard( new Card( 2 , 7 ) );
sHand.clear();
sHand.addCard( new Card( 4 , 2 ) );
sHand.addCard( new Card( 4 , 3 ) );
sHand.addCard( new Card( 4 , 5 ) );
sHand.addCard( new Card( 4 , 5 ) );
sHand.addCard( new Card( 4 , 6 ) );
sHand.addCard( new Card( 4 , 6 ) );
wHand.clear();
wHand.addCard( new Card( 4 , 2 ) );
wHand.addCard( new Card( 4 , 3 ) );
wHand.addCard( new Card( 4 , 7 ) );
wHand.addCard( new Card( 4 , 7 ) );
wHand.addCard( new Card( 4 , 8 ) );
wHand.addCard( new Card( 4 , 8 ) );
testTrick = new Trick( 10 , 4 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "N" );

//trumping multiple tractors unsuccessfully because 1 trump tractor
//is too short
nHand.clear();
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 13 ) );
nHand.addCard( new Card( 1 , 13 ) );
nHand.addCard( new Card( 1 , 5 ) );
nHand.addCard( new Card( 1 , 5 ) );
nHand.addCard( new Card( 1 , 6 ) );
nHand.addCard( new Card( 1 , 6 ) );
nHand.addCard( new Card( 1 , 7 ) );
nHand.addCard( new Card( 1 , 7 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 2 ) );
eHand.addCard( new Card( 1 , 3 ) );
eHand.addCard( new Card( 1 , 4 ) );
eHand.addCard( new Card( 2 , 2 ) );
eHand.addCard( new Card( 2 , 3 ) );
eHand.addCard( new Card( 2 , 7 ) );
eHand.addCard( new Card( 2 , 11 ) );
eHand.addCard( new Card( 2 , 12 ) );
eHand.addCard( new Card( 2 , 2 ) );
eHand.addCard( new Card( 2 , 3 ) );
sHand.clear();
sHand.addCard( new Card( 4 , 2 ) );
sHand.addCard( new Card( 4 , 2 ) );
sHand.addCard( new Card( 4 , 5 ) );
sHand.addCard( new Card( 4 , 5 ) );
sHand.addCard( new Card( 4 , 6 ) );
sHand.addCard( new Card( 4 , 6 ) );
sHand.addCard( new Card( 4 , 9 ) );
sHand.addCard( new Card( 4 , 9 ) );
sHand.addCard( new Card( 4 , 11 ) );
sHand.addCard( new Card( 4 , 11 ) );
wHand.clear();
wHand.addCard( new Card( 4 , 12 ) );
wHand.addCard( new Card( 4 , 12 ) );
wHand.addCard( new Card( 4 , 13 ) );
wHand.addCard( new Card( 4 , 13 ) );
wHand.addCard( new Card( 4 , 1 ) );
wHand.addCard( new Card( 4 , 1 ) );
wHand.addCard( new Card( 3 , 10 ) );
wHand.addCard( new Card( 3 , 10 ) );
wHand.addCard( new Card( 4 , 10 ) );
wHand.addCard( new Card( 5 , 0 ) );
testTrick = new Trick( 10 , 4 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "N" );

//successfully trumping multiple tractors unsuccessfully
nHand.clear();
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 13 ) );
nHand.addCard( new Card( 1 , 13 ) );
nHand.addCard( new Card( 1 , 5 ) );
nHand.addCard( new Card( 1 , 5 ) );
nHand.addCard( new Card( 1 , 6 ) );
nHand.addCard( new Card( 1 , 6 ) );
nHand.addCard( new Card( 1 , 7 ) );
nHand.addCard( new Card( 1 , 7 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 2 ) );
eHand.addCard( new Card( 1 , 3 ) );
eHand.addCard( new Card( 1 , 4 ) );
eHand.addCard( new Card( 2 , 2 ) );
eHand.addCard( new Card( 2 , 3 ) );
eHand.addCard( new Card( 2 , 7 ) );
eHand.addCard( new Card( 2 , 11 ) );
eHand.addCard( new Card( 2 , 12 ) );
eHand.addCard( new Card( 2 , 2 ) );
eHand.addCard( new Card( 2 , 3 ) );
sHand.clear();
sHand.addCard( new Card( 4 , 2 ) );
sHand.addCard( new Card( 4 , 2 ) );
sHand.addCard( new Card( 4 , 5 ) );
sHand.addCard( new Card( 4 , 5 ) );
sHand.addCard( new Card( 4 , 6 ) );
sHand.addCard( new Card( 4 , 6 ) );
sHand.addCard( new Card( 4 , 9 ) );
sHand.addCard( new Card( 4 , 9 ) );
sHand.addCard( new Card( 4 , 11 ) );
sHand.addCard( new Card( 4 , 11 ) );
wHand.clear();
wHand.addCard( new Card( 4 , 12 ) );
wHand.addCard( new Card( 4 , 12 ) );
wHand.addCard( new Card( 4 , 13 ) );
wHand.addCard( new Card( 4 , 13 ) );
wHand.addCard( new Card( 4 , 1 ) );
wHand.addCard( new Card( 4 , 1 ) );
wHand.addCard( new Card( 3 , 10 ) );
wHand.addCard( new Card( 3 , 10 ) );
wHand.addCard( new Card( 4 , 10 ) );
wHand.addCard( new Card( 4 , 10 ) );
testTrick = new Trick( 10 , 4 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "W" );

//test dumping with tractor, pairs, and singles
//(trump is successful)
nHand.clear();
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 13 ) );
nHand.addCard( new Card( 1 , 12 ) );
nHand.addCard( new Card( 1 , 12 ) );
nHand.addCard( new Card( 1 , 5 ) );
nHand.addCard( new Card( 1 , 5 ) );
nHand.addCard( new Card( 1 , 6 ) );
nHand.addCard( new Card( 1 , 6 ) );
nHand.addCard( new Card( 1 , 7 ) );
nHand.addCard( new Card( 1 , 7 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 2 ) );
eHand.addCard( new Card( 1 , 3 ) );
eHand.addCard( new Card( 1 , 4 ) );
eHand.addCard( new Card( 2 , 2 ) );
eHand.addCard( new Card( 2 , 3 ) );
eHand.addCard( new Card( 2 , 7 ) );
eHand.addCard( new Card( 2 , 11 ) );
eHand.addCard( new Card( 2 , 12 ) );
eHand.addCard( new Card( 2 , 2 ) );
eHand.addCard( new Card( 2 , 3 ) );
eHand.addCard( new Card( 2 , 1 ) );
sHand.clear();
sHand.addCard( new Card( 4 , 2 ) );
sHand.addCard( new Card( 4 , 2 ) );
sHand.addCard( new Card( 4 , 5 ) );
sHand.addCard( new Card( 4 , 5 ) );
sHand.addCard( new Card( 4 , 6 ) );
sHand.addCard( new Card( 4 , 6 ) );
sHand.addCard( new Card( 4 , 9 ) );
sHand.addCard( new Card( 4 , 9 ) );
sHand.addCard( new Card( 4 , 11 ) );
sHand.addCard( new Card( 4 , 11 ) );
sHand.addCard( new Card( 6 , 0 ) );
wHand.clear();
wHand.addCard( new Card( 4 , 12 ) );
wHand.addCard( new Card( 4 , 12 ) );
wHand.addCard( new Card( 4 , 13 ) );
wHand.addCard( new Card( 4 , 13 ) );
wHand.addCard( new Card( 4 , 1 ) );
wHand.addCard( new Card( 4 , 1 ) );
wHand.addCard( new Card( 3 , 10 ) );
wHand.addCard( new Card( 3 , 10 ) );
wHand.addCard( new Card( 4 , 10 ) );
wHand.addCard( new Card( 4 , 10 ) );
wHand.addCard( new Card( 5 , 0 ) );
testTrick = new Trick( 10 , 4 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "W" );

//(trump is unsuccessful)
nHand.clear();
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 1 ) );
nHand.addCard( new Card( 1 , 13 ) );
nHand.addCard( new Card( 1 , 12 ) );
nHand.addCard( new Card( 1 , 12 ) );
nHand.addCard( new Card( 1 , 5 ) );
nHand.addCard( new Card( 1 , 5 ) );
nHand.addCard( new Card( 1 , 6 ) );
nHand.addCard( new Card( 1 , 6 ) );
nHand.addCard( new Card( 1 , 7 ) );
nHand.addCard( new Card( 1 , 7 ) );
eHand.clear();
eHand.addCard( new Card( 1 , 2 ) );
eHand.addCard( new Card( 1 , 3 ) );
eHand.addCard( new Card( 1 , 4 ) );
eHand.addCard( new Card( 2 , 2 ) );
eHand.addCard( new Card( 2 , 3 ) );
eHand.addCard( new Card( 2 , 7 ) );
eHand.addCard( new Card( 2 , 11 ) );
eHand.addCard( new Card( 2 , 12 ) );
eHand.addCard( new Card( 2 , 2 ) );
eHand.addCard( new Card( 2 , 3 ) );
eHand.addCard( new Card( 2 , 1 ) );
sHand.clear();
sHand.addCard( new Card( 4 , 2 ) );
sHand.addCard( new Card( 4 , 3 ) );
sHand.addCard( new Card( 4 , 5 ) );
sHand.addCard( new Card( 4 , 5 ) );
sHand.addCard( new Card( 4 , 6 ) );
sHand.addCard( new Card( 4 , 6 ) );
sHand.addCard( new Card( 4 , 9 ) );
sHand.addCard( new Card( 4 , 9 ) );
sHand.addCard( new Card( 4 , 11 ) );
sHand.addCard( new Card( 4 , 11 ) );
sHand.addCard( new Card( 6 , 0 ) );
wHand.clear();
wHand.addCard( new Card( 4 , 12 ) );
wHand.addCard( new Card( 4 , 12 ) );
wHand.addCard( new Card( 4 , 13 ) );
wHand.addCard( new Card( 4 , 13 ) );
wHand.addCard( new Card( 4 , 1 ) );
wHand.addCard( new Card( 6 , 0 ) );
wHand.addCard( new Card( 3 , 10 ) );
wHand.addCard( new Card( 3 , 10 ) );
wHand.addCard( new Card( 4 , 10 ) );
wHand.addCard( new Card( 4 , 10 ) );
wHand.addCard( new Card( 5 , 0 ) );
testTrick = new Trick( 10 , 4 , nHand , "N" );
testTrick.setCardsPlayed( "E" , eHand );
testTrick.setCardsPlayed( "S" , sHand );
testTrick.setCardsPlayed( "W" , wHand );
assert( testTrick.determineWinner() == "N" );
console.log( "Tests finished" );
//*/
