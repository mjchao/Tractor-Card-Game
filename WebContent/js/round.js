/**
 * Stores global (w.r.t to the players, not the code) information about the
 * round, such as the level, the declared suit, etc.
 */
function RoundData( level , starter ) {
	this.level = level;
	this.starter = starter;
	this.declared = 0;
	this.overriden = false;
	this.points = 0;
	
	this.handDec = new Hand();
	this.handDec.visible = true;
	this.handDec.verticalCards = true;
	this.lastDeclarer = "";
	
	this.isDeclared = function() {
		return this.declared != 0;
	}
	
	/**
	 * Checks if the given hand can declare the given suit for this round.
	 * 
	 * @param hand
	 * @param level
	 * @param suit
	 * @returns {Boolean}
	 */
	this.canDeclare = function( player , hand , suit ) {
		var quantity;
		if ( suit > 4 ) {
			quantity = 2;
		}
		else {
			quantity = 1;
		}
		
		if ( player == this.lastDeclarer ) {
			quantity -= this.handDec.countCards( this.level , suit );
		}
		
		for( var i=0 ; i<hand.size() ; ++i ) {
			var card = hand.get( i );
			if ( card.value == this.level && card.suit == suit ) {
				--quantity;
			}
			else if ( suit > 4 && card.suit == suit ) {
				--quantity;
			}
		}
		
		return quantity <= 0;
	}
	
	this.declare = function( player , hand , suit ) {
		if ( this.canDeclare( player , hand , suit ) ) {
			this.declared = suit;
			if ( suit == 5 || suit == 6 ) {
				this.overriden = true;
			}
			return true;
		}
		return false;
	}
	
	/**
	 * Checks if the given hand can override the currently declared trump suit.
	 * 
	 * @param hand
	 * @param level
	 * @param suit
	 * @returns {Boolean}
	 */
	this.canOverride = function( player , hand , suit ) {
		if ( this.overriden ) {
			if ( suit <= 4 ) {
				return false;
			}
			if ( suit > 4 && this.declared >= suit ) {
				return false;
			}
		}
		var quantity = 2;
		
		if ( player == this.lastDeclarer ) {
			quantity -= this.handDec.countCards( this.level , suit );
		}
		
		for ( var i=0 ; i<hand.size() ; ++i ) {
			var card = hand.get( i );
			if ( card.value == this.level && card.suit == suit ) {
				--quantity;
			}
			else if ( suit > 4 && card.suit == suit ) {
				--quantity;
			}
		}
		
		if ( suit <= 4 ) {
			return quantity <= 0;
		}
		else if ( suit == 5 ) {
			return this.declared < 5 && quantity <= 0;
		}
		else if ( suit == 6 ) {
			return quantity <= 0;
		}
	}
	
	this.override = function( player , hand , suit ) {
		if ( this.canOverride( player , hand , suit ) ) {
			this.declared = suit;
			this.overriden = true;
			return true;
		}
		return false;
	}
}

function getFirstRoundFirstDrawer() {
	var idx = Math.floor( Math.random()*4 );
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
}

function Round( level , starter ) {
	this.roundData = new RoundData( level , starter );
	
	this.handN = new Hand();
	this.handN.visible = false;
	this.handN.verticalCards = true;
	
	this.handS = new Hand();
	this.handS.visible = true;
	this.handS.verticalCards = true;
	
	this.handE = new Hand();
	this.handE.visible = false;
	this.handE.verticalCards = false;
	
	this.handW = new Hand();
	this.handW.visible = false;
	this.handW.verticalCards = false;
	
	this.bottom = new Hand();
	this.bottom.visible = false;
	this.bottom.verticalCards = true;
	
	if ( starter == "?" ) {
		var randomFirstDrawer = getFirstRoundFirstDrawer();
		this.dealer = new Dealer( this.handN , this.handS , 
				this.handE , this.handW , this.bottom , randomFirstDrawer );
		this.dealer.reset( randomFirstDrawer );
	}
	else {
		this.dealer = new Dealer( this.handN , this.handS , 
								this.handE , this.handW , this.bottom , starter );
		this.dealer.reset( starter );
	}
	
	var pnlNorth = document.getElementById( "pnlNorth" );
	var pnlSouth = document.getElementById( "pnlSouth" );
	var pnlEast = document.getElementById( "pnlEast" );
	var pnlWest = document.getElementById( "pnlWest" );
	
	this.dispN = new HandDisplay( this.dealer.getNorth() , "N" );
	this.dispS = new HandDisplay( this.dealer.getSouth() , "S" );
	this.dispE = new HandDisplay( this.dealer.getEast() , "E" );
	this.dispW = new HandDisplay( this.dealer.getWest() , "W" );
	
	var cmdSpades = document.getElementById( "cmdSpades" );
	cmdSpades.setAttribute( "class" , "declareDisabled" );
	var cmdHearts = document.getElementById( "cmdHearts" );
	cmdHearts.setAttribute( "class" , "declareDisabled" );
	var cmdClubs = document.getElementById( "cmdClubs" );
	cmdClubs.setAttribute( "class" , "declareDisabled" );
	var cmdDiamonds = document.getElementById( "cmdDiamonds" );
	cmdDiamonds.setAttribute( "class" , "declareDisabled" );
	var cmdNoTrump = document.getElementById( "cmdNoTrump" );
	cmdNoTrump.setAttribute( "class" , "declareDisabled" );
	
	this.updateDeclarationButtons = function( hand ) {
		if ( !this.roundData.isDeclared() ) {
			if ( this.roundData.canDeclare( "S" , hand , 5 ) || 
					this.roundData.canDeclare( "S" , hand , 6 )) {
				cmdNoTrump.setAttribute( "class" , "declare" );
			}
			else {
				cmdNoTrump.setAttribute( "class" , "declareDisabled" );
			}
			if ( this.roundData.canDeclare( "S" , hand , 4 ) ) {
				cmdSpades.setAttribute( "class" , "declare" );
			}
			else {
				cmdSpades.setAttribute( "class" , "declareDisabled" );
			}
			if ( this.roundData.canDeclare( "S" , hand , 3 ) ) {
				cmdHearts.setAttribute( "class" , "declare" );
			}
			else {
				cmdHearts.setAttribute( "class" , "declareDisabled" );
			}
			if ( this.roundData.canDeclare( "S" , hand , 2 ) ) {
				cmdClubs.setAttribute( "class" , "declare" );
			}
			else {
				cmdClubs.setAttribute( "class" , "declareDisabled" );
			}
			if ( this.roundData.canDeclare( "S" , hand , 1 ) ) {
				cmdDiamonds.setAttribute( "class" , "declare" );
			}
			else {
				cmdDiamonds.setAttribute( "class" , "declareDisabled" );
			}
		}
		else {
			if ( this.roundData.canOverride( "S" , hand , 5 ) || 
					this.roundData.canOverride( "S" , hand , 6 ) ) {
				cmdNoTrump.setAttribute( "class" , "declare" );
			}
			else {
				cmdNoTrump.setAttribute( "class" , "declareDisabled" );
			}
			if ( this.roundData.canOverride( "S" , hand , 4 ) ) {
				cmdSpades.setAttribute( "class" , "declare" );
			}
			else {
				cmdSpades.setAttribute( "class" , "declareDisabled" );
			}
			if ( this.roundData.canOverride( "S" , hand , 3 ) ) {
				cmdHearts.setAttribute( "class" , "declare" );
			}
			else {
				cmdHearts.setAttribute( "class" , "declareDisabled" );
			}
			if ( this.roundData.canOverride( "S" , hand , 2 ) ) {
				cmdClubs.setAttribute( "class" , "declare" );
			}
			else {
				cmdClubs.setAttribute( "class" , "declareDisabled" );
			}
			if ( this.roundData.canOverride( "S" , hand , 1 ) ) {
				cmdDiamonds.setAttribute( "class" , "declare" );
			}
			else {
				cmdDiamonds.setAttribute( "class" , "declareDisabled" );
			}
		}
	}
	
	this.renderDeclaredHands = function() {
		this.handN.renderDeclaredOffsets( this.dealer.level , 
													this.roundData.declared );
		this.handS.renderDeclaredOffsets( this.dealer.level , 
													this.roundData.declared );
		this.handE.renderDeclaredOffsets( this.dealer.level , 
													this.roundData.declared );
		this.handW.renderDeclaredOffsets( this.dealer.level , 
													this.roundData.declared );
		
		this.dispN.render( pnlNorth );
		this.dispS.render( pnlSouth );
		this.dispE.render( pnlEast );
		this.dispW.render( pnlWest );
	}
	
	this.deal = function() {
		if ( !this.dealer.finished() ) {
			this.dealer.deal();
			this.dispN.render( pnlNorth );
			this.dispS.render( pnlSouth );
			this.dispE.render( pnlEast );
			this.dispW.render( pnlWest );
		}
		else {
			this.renderDeclaredHands();
		}
		this.updateDeclarationButtons( this.handS );
	}
	
	this.canDeclare = function( player , suit ) {
		var hand;
		if ( player == "N" ) {
			hand = this.handN;
		}
		else if ( player == "S" ) {
			hand = this.handS;
		}
		else if ( player == "E" ) {
			hand = this.handE;
		}
		else if ( player == "W" ) {
			hand = this.handW;
		}
		
		if ( this.roundData.isDeclared() ) {
			return this.roundData.canOverride( player , hand , suit );
		}
		else {
			return this.roundData.canDeclare( player , hand , suit );
		}
	}
	
	this.tryDeclare = function( player , suit ) {

		var hand;
		if ( player == "N" ) {
			hand = this.handN;
		}
		else if ( player == "S" ) {
			hand = this.handS;
		}
		else if ( player == "E" ) {
			hand = this.handE;
		}
		else if ( player == "W" ) {
			hand = this.handW;
		}
		
		if ( this.roundData.isDeclared() ) {
			var success = this.roundData.override( player , hand , suit );
			if ( success ) {
				this.showDeclaration( player , suit , 2 );
			}
		}
		else {
			var success = this.roundData.declare( player , hand , suit );
			if ( success ) {
				if ( suit <= 4 ) {
					this.showDeclaration( player , suit , 1 );
				}
				else {
					this.showDeclaration( player , suit , 2 );
				}
			}
		}
		this.updateDeclarationButtons( this.handS );
	}
	
	this.returnDeclaredCards = function() {
		var player = this.roundData.lastDeclarer;
		var hand;
		var disp;
		var container;
		var returnVisible;
		var returnVertical;
		if ( player == "N" ) {
			hand = this.handN;
			disp = this.dispN;
			container = pnlNorth;
			returnVisible = false;
			returnVertical = true;
		}
		else if ( player == "S" ) {
			hand = this.handS;
			disp = this.dispS;
			container = pnlSouth;
			returnVisible = true;
			returnVertical = true;
		}
		else if ( player == "E" ) {
			hand = this.handE;
			disp = this.dispE;
			container = pnlEast;
			returnVisible = false;
			returnVertical = false;
		}
		else if ( player == "W" ) {
			hand = this.handW;
			disp = this.dispW;
			container = pnlWest;
			returnVisible = false;
			returnVertical = false;
		}
		else {
			return;
		}
		
		while( this.roundData.handDec.size() > 0 ) {
			var card = this.roundData.handDec.get( 0 );
			hand.addCard( card );
			card.setVisible( returnVisible );
			card.setVertical( returnVertical );
			this.roundData.handDec.removeCard( card );
		}
		
		hand.renderDealingOffsets( this.roundData.level );
		disp.render( container );
		pnlCenter.innerHTML = "";
	}
	
	/**
	 * Shows cards of the given suit as trump declaration. This should only be
	 * called if the player actually can declare/override, and the quantity
	 * must be 1 or 2.
	 * 
	 * @param player the declarer
	 * @param suit the suit being declared as trump
	 * @param quantity 1 or 2, the number of cards being used to declare
	 */
	this.showDeclaration = function( player , suit , quantity ) {
		
		//return the cards to the last declarer if any
		this.returnDeclaredCards();
		this.roundData.lastDeclarer = player;
		
		var hand;
		var disp;
		var container;
		var pnlCenter = document.getElementById( "pnlCenter" );
		if ( player == "N" ) {
			hand = this.handN;
			disp = this.dispN;
			container = pnlNorth;
		}
		else if ( player == "S" ) {
			hand = this.handS;
			disp = this.dispS;
			container = pnlSouth;
		}
		else if ( player == "E" ) {
			hand = this.handE;
			disp = this.dispE;
			container = pnlEast;
		}
		else if ( player == "W" ) {
			hand = this.handW;
			disp = this.dispW;
			container = pnlWest;
		}
		
		for ( var i=0 ; i<hand.size() ; ++i ) {
			var card = hand.get( i );
			var removed = false;
			if ( (card.suit == suit && card.value == level) || 
					(card.suit == suit && suit > 4) ) {
				hand.removeCard( card );
				card.setVisible( true );
				card.setVertical( true );
				this.roundData.handDec.addCard( card );
				removed = true;
			}
			
			//the next card must be of the same value and suit
			if ( removed ) {
				if ( quantity == 2 ) {
					card = hand.get( i );
					hand.removeCard( card );
					card.setVisible( true );
					card.setVertical( true );
					this.roundData.handDec.addCard( card );
				}
				break;
			}
		}
		
		hand.renderDealingOffsets( this.roundData.level );
		disp.render( container );
		
		pnlCenter.innerHTML = "";
		var dispC = new HandDisplay( this.roundData.handDec , player );
		dispC.renderCenter( pnlCenter );
	}
	
	this.showPlayedCards = function( player , handPlayed ) {
		var pnlCenter = document.getElementById( "pnlCenter" );
		handPlayed.renderDealingOffsets( this.roundData.level );
		var dispC = new HandDisplay( handPlayed , player );
		dispC.renderCenter( pnlCenter );
	}
	//*/
}




//*/