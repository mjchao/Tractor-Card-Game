function AIData( hand ) {
	//TODO figure out all the AI data that's needed
	this.hand = hand;
}

function AI( data ) {
	//TODO implement smarter AI
	this.data = data;
	
	/**
	 * Called whenever a new round begins, so that the AI may reset its
	 * "knowledge" and hand.
	 */
	this.onNewRound = function( ROUND , hand ) {
		this.data = new AIData( hand );
	}
	
	this.wantFlipNoTrump = function( ROUND ) {
		return false;
		if ( ROUND.roundData.starter == "?" ) {
			return true;
		}
		return false;
	}
	
	this.wantFlipSpades = function( ROUND ) {
		return false;
		if ( ROUND.roundData.starter == "?" ) {
			return true;
		}
		return false;
	}
	
	this.wantFlipHearts = function( ROUND ) {
		return false;
		if ( ROUND.roundData.starter == "?" ) {
			return true;
		}
		return false;
	}
	
	this.wantFlipClubs = function( ROUND ) {
		return false;
		if ( ROUND.roundData.starter == "?" ) {
			return true;
		}
		return false;
	}
	
	this.wantFlipDiamonds = function( ROUND ) {
		return false;
		if ( ROUND.roundData.starter == "?" ) {
			return true;
		}
		return false;
	}
	
	this.unselectAll = function() {
		for ( var i=0 ; i<this.data.hand.size() ; ++i ) {
			this.data.hand.get( i ).setSelected( false );
		}
	}
	
	this.lead = function( ROUND ) {
		var randIdx = Math.floor( Math.random() * this.data.hand.size() );
		this.data.hand.get( randIdx ).setSelected( true );
	}
	
	/**
	 * Selects card(s) given the current state of the trick.
	 * 
	 * @param ROUND the data about the current round
	 * @param TRICK the current state of the trick. this should not be modified
	 * and only read from!
	 */
	this.play = function( ROUND , TRICK ) {
		if ( TRICK.firstHand.size() > 1 ) {
			alert( "I don't know how to play more than 1 card at a time :(" );
			return;
		}
		else {
			var myHand = this.data.hand;
			var suit = TRICK.firstHand.get( 0 ).suit;
			var isTrump = TRICK.isTrump( TRICK.firstHand.get( 0 ) );
			if ( isTrump ) {
				for ( var i=0 ; i<myHand.size() ; ++i ) {
					if ( TRICK.isTrump( myHand.get( i ) ) ) {
						myHand.get( i ).setSelected( true );
						return;
					}
				}
			}
			else {
				for ( var i=0 ; i<myHand.size() ; ++i ) {
					if ( !TRICK.isTrump( myHand.get( i ) ) && 
									myHand.get( i ).suit == suit ) {
						myHand.get( i ).setSelected( true );
						return;
					}
				}
			}
			myHand.get( 0 ).setSelected( true );
		}
	}
	
	/**
	 * 
	 */
	this.makeBottom = function( ROUND ) {
		console.log( "Making bottom" );
		for ( var i=0 ; i<8 ; ++i ) {
			var idxToHide;
			do {
				idxToHide = Math.floor( Math.random() * this.data.hand.size() );
			} while ( this.data.hand.get( idxToHide ).selected );
			this.data.hand.get( idxToHide ).setSelected( true );
		}
	}
}