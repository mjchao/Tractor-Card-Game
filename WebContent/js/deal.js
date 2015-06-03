/**
 * Represents a dealer in the game. Let 0=S, 1=W, 2=N, 3=E. Cards will be dealt
 * in a clockwise order.
 * 
 * @param north the hand belonging to the north player
 * @param south the hand belonging to the south player
 * @param east the hand belonging to the east player
 * @param west the hand belonging to the west player
 * @param start the person who should receive the first card, "N", "S", "E", or
 * "W"
 */
function Dealer( north , south , east , west , bottom , start ) {
	this.north = north;
	this.south = south;
	this.east = east;
	this.west = west;
	this.bottom = bottom;
	this.level = 2;
	
	this.getNorth = function() {
		return this.north;
	}
	
	this.getSouth = function() {
		return this.south;
	}
	
	this.getEast = function() {
		return this.east;
	}
	
	this.getWest = function() {
		return this.west;
	}
	
	this.getBottom = function() {
		return this.bottom;
	}

	/**
	 * Resets the dealer's deck in preparation for another round. 
	 * The bottom is created from the top 8 cards in the shuffled deck.
	 * The first card thereafter will be dealt to the specified player.
	 * 
	 * @param start the player to receive the first card
	 */
	this.resetDeck = function( start ) {
		
		//represents the next person to receive a card
		this.currIdx = 0;
		this.north.clear();
		this.south.clear();
		this.east.clear();
		this.west.clear();
		this.bottom.clear();
		this.start = start;
		
		this.deck = new Deck();
		this.deck.shuffle();
		
		//get the bottom
		for ( var i=0 ; i<8 ; ++i ) {
			this.bottom.addCard( this.deck.draw() );
		}
		
		if ( start == "N" ) {
			this.currIdx = 2;
		}
		else if ( start == "S" ) {
			this.currIdx = 0;
		}
		else if ( start == "E" ) {
			this.currIdx = 3;
		}
		else if ( start == "W" ) {
			this.currIdx = 1;
		}
	}
	
	/**
	 * Resets the dealer's deck and the current level back to 2. The first card
	 * will be dealt to the specified player.
	 * 
	 * @param start the player to receive the first card
	 */
	this.reset = function( start ) {
		this.level = 2;
		this.resetDeck( start );
	}
	
	this.setLevel = function( level ) {
		this.level = level;
	}
	
	/**
	 * Deals cards to every player up until the south hand, so that the human
	 * player can decide whether or not to declare.
	 */
	this.deal = function() {
		do {
			this.giveCardTo( this.currIdx );
			this.currIdx += 1;
			this.currIdx %= 4;
		}
		while( this.currIdx != 1 && !this.finished() );
		
		this.north.renderDealingOffsets( this.level );
		this.south.renderDealingOffsets( this.level );
		this.east.renderDealingOffsets( this.level );
		this.west.renderDealingOffsets( this.level );
		
	}
	
	this.giveCardTo = function( idx ) {
		var nextCard = this.deck.draw();
		
		if ( idx == 0 ) {
			this.south.addCard( nextCard );
		}
		else if ( idx == 1 ) {
			this.west.addCard( nextCard );
		}
		else if ( idx == 2 ) {
			this.north.addCard( nextCard );
		}
		else if ( idx == 3 ) {
			this.east.addCard( nextCard );
		}
	}
	
	this.finished = function() {
		return this.deck.size() == 84;
	}
	
	this.reset( start );
}

/*
var northHand = new Hand();
northHand.visible = true;
northHand.verticalCards = true;

var southHand = new Hand();
southHand.visible = true;
southHand.verticalCards = true;

var eastHand = new Hand();
eastHand.visible = true;
eastHand.verticalCards = false;

var westHand = new Hand();
westHand.visible = true;
westHand.verticalCards = false;

var bottom = new Hand();
bottom.visible = false;
bottom.verticalCards = true;

var dealer = new Dealer( northHand , southHand , eastHand , westHand , 
																bottom , 1 );
dealer.reset();
var pnlNorth = document.getElementById( "pnlNorth" );
var pnlSouth = document.getElementById( "pnlSouth" );
var pnlEast = document.getElementById( "pnlEast" );
var pnlWest = document.getElementById( "pnlWest" );

function deal() {
	if ( !dealer.finished() ) {
		dealer.deal();
		var dispN = new HandDisplay( dealer.getNorth() , "N" );
		dispN.render( pnlNorth );
		var dispS = new HandDisplay( dealer.getSouth() , "S" );
		dispS.render( pnlSouth );
		var dispE = new HandDisplay( dealer.getEast() , "E" );
		dispE.render( pnlEast );
		var dispW = new HandDisplay( dealer.getWest() , "W" );
		dispW.render( pnlWest );
	}
	else {
		dealer.declared = 2;
		northHand.renderDeclaredOffsets( dealer.level , dealer.declared );
		southHand.renderDeclaredOffsets( dealer.level , dealer.declared );
		eastHand.renderDeclaredOffsets( dealer.level , dealer.declared );
		westHand.renderDeclaredOffsets( dealer.level , dealer.declared );
		
		var dispN = new HandDisplay( dealer.getNorth() , "N" );
		dispN.render( pnlNorth );
		var dispS = new HandDisplay( dealer.getSouth() , "S" );
		dispS.render( pnlSouth );
		var dispE = new HandDisplay( dealer.getEast() , "E" );
		dispE.render( pnlEast );
		var dispW = new HandDisplay( dealer.getWest() , "W" );
		dispW.render( pnlWest );
	}
}
document.getElementById( "cmdDeal" ).onclick = deal;
//*/
