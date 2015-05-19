/**
 * Represents a panel for displaying the cards in a hand
 * 
 * @param hand the hand of cards to display 
 * @param location the location where the hand will be displayed, N, S, E, or W
 */
function HandDisplay( hand , location ) {
	this.panel = document.createElement( "div" );
	this.hand = hand;
	this.location = location;
	
	this.render = function( container ) {
		
		//allow all cards in player's hands to be selected if they are face up
		for ( var i=0 ; i<this.hand.size() ; ++i ) {
			this.hand.get( i ).toggleSelection( true );
		}
		
		//remove all current cards
		container.innerHTML = "";
		this.panel.innerHTML = "";
		
		//nothing to do if there are no cards to add
		if ( this.hand.size() == 0 ) {
			return;
		}
		
		//re-determine the orientation of the panel
		if ( this.hand.verticalCards ) {
			this.panel.setAttribute( "class" , "hHand" );
		}
		else {
			this.panel.setAttribute( "class" , "vHand" );
		}
		
		//re-determine the location of the panel
		if ( this.location == "N" ) {
			this.panel.setAttribute( "id" , "pnlHandN" );
		}
		else if ( this.location == "S" ) {
			this.panel.setAttribute ( "id" , "pnlHandS" );
		}
		else if ( this.location == "E" ) {
			this.panel.setAttribute( "id" , "pnlHandE" );
		}
		else if ( this.location == "W" ) {
			this.panel.setAttribute( "id" , "pnlHandW" );
		}
		
		//add all the cards in the hand to the panel
		this.hand.addToPanel( this.panel );
		
		//center the panel
		if ( this.hand.verticalCards ) {
			
			//update the width of this panel
			var handWidth = hand.get( hand.size()-1 ).getImage().style.left;
			handWidth = Number( handWidth.substring( 0 , 
													handWidth.length-2) ) + 72;
			this.panel.style.width = handWidth + "px";
			
			//.style.width does not work anymore
			var parentWidth = 0;
			if ( this.location == "N" ) {
				parentWidth = 750;
			}
			else if ( this.location == "S" ) {
				parentWidth = 1000;
			}
			this.panel.style.left = (parentWidth - handWidth)/2 + "px";
		}
		else {
			
			//update the height of this panel
			var handHeight = hand.get( hand.size()-1 ).getImage().style.top;
			handHeight = Number( handHeight.substring( 0 , 
													handHeight.length-2) ) + 72;
			
			//.style.width does not work anymore
			var parentHeight = 450;
			this.panel.style.top = (parentHeight - handHeight)/2 + "px";
		}
		
		container.appendChild( this.panel );
	}
	
	this.renderCenter = function( container ) {
		for ( var i=0 ; i<this.hand.size() ; ++i ) {
			this.hand.get( i ).toggleSelection( false );
		}
		this.panel.innerHTML = "";
		
		if ( this.hand.size() == 0 ) {
			return;
		}
		
		this.panel.setAttribute( "class" , "hHand" );
		this.hand.addToPanel( this.panel );
		
		var centerWidth = 750;
		var centerHeight = 325;
		var panelTop = 0;
		var panelLeft = 0;
		var handWidth = hand.get( hand.size()-1 ).getImage().style.left;
		handWidth = Number( handWidth.substring( 0 , 
												handWidth.length-2) ) + 72;
		var handHeight = 100;
		if ( this.location == "N" ) {
			panelTop = 5;
			panelLeft = (centerWidth - handWidth)/2;
		}
		else if ( this.location == "S" ) {
			panelTop = centerHeight - handHeight - 5;
			panelLeft = (centerWidth - handWidth)/2;
		}
		else if ( this.location == "E" ) {
			panelTop = (centerHeight - handHeight)/2;
			panelLeft = centerWidth - handWidth - 5;
		}
		else if ( this.location == "W" ) {
			panelTop = (centerHeight - handHeight)/2;
			panelLeft = 5;
		}
		else if ( this.location == "C" ) {
			panelTop = (centerHeight - handHeight)/2;
			panelLeft = (centerWidth - handWidth)/2;
		}
		
		this.panel.style.top = panelTop + "px";
		this.panel.style.left = panelLeft + "px";
		container.appendChild( this.panel );
	}
	
	this.getPanel = function() {
		return this.panel;
	}
}

/*
var deck = new Deck();
deck.shuffle();

var hand = new Hand( true , true );
for( var i=0 ; i<20 ; ++i ) {
	hand.addCard( deck.draw() );
}
hand.renderDeclaredOffsets( 2 , 3 );

var disp = new HandDisplay( hand , "S" );
var pnlSouth = document.getElementById( "pnlSouth" );
disp.render( pnlSouth );

var hand2 = new Hand( false , false );
for( var i=20 ; i<40 ; ++i ) {
	hand2.addCard( deck.draw() );
}
hand2.renderDeclaredOffsets( 2 , 3 );

var disp2 = new HandDisplay( hand2 , "W" );
var pnlWest = document.getElementById( "pnlWest" );
disp2.render( pnlWest );

var hand3 = new Hand( false , false );
for ( var i=40 ; i<60 ; ++i ) {
	hand3.addCard( deck.draw() );
}
hand3.renderDeclaredOffsets( 2 , 3 );

var disp3 = new HandDisplay( hand3 , "E" );
var pnlEast = document.getElementById( "pnlEast" );
disp3.render( pnlEast );

var hand4 = new Hand( true , false );
hand4.visible = false;
hand4.verticalCards = true;
for ( var i=60 ; i<80 ; ++i ) {
	hand4.addCard( deck.draw() );
}
hand4.renderDeclaredOffsets( 2 , 3 );

var disp4 = new HandDisplay( hand4 , "N" );
var pnlNorth = document.getElementById( "pnlNorth" );
disp4.render( pnlNorth );

var playNorth = new Hand( true , true );
var playSouth = new Hand( true , true );
var playEast = new Hand( true , true );
var playWest = new Hand( true , true );
for ( var i=0 ; i<1 ; ++i ) {
	playNorth.addCard( deck.draw() );
	playSouth.addCard( deck.draw() );
	playEast.addCard( deck.draw() );
	playWest.addCard( deck.draw() );
}

playNorth.renderDeclaredOffsets( 2 , 3 );
playSouth.renderDeclaredOffsets( 2 , 3 );
playEast.renderDeclaredOffsets( 2 , 3 );
playWest.renderDeclaredOffsets( 2 , 3 );

var pnlCenter = document.getElementById( "pnlCenter" );
var dispPlayNorth = new HandDisplay( playNorth , "N" );
dispPlayNorth.renderCenter( pnlCenter );
var dispPlaySouth = new HandDisplay( playSouth , "S" );
dispPlaySouth.renderCenter( pnlCenter );
var dispPlayEast = new HandDisplay( playEast , "E" );
dispPlayEast.renderCenter( pnlCenter );
var dispPlayWest = new HandDisplay( playWest , "W" );
dispPlayWest.renderCenter( pnlCenter );
//*/
