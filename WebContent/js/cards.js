/**
 * Creates a card object that represents one card in the player's hand.
 * 
 * @param suit the suit of the card, 1-6, representing 1=D, 2=C, 3=H, 4=S, 
 * 5=small joker and 6=big joker
 * @param value the value of the card from 1-13, representing A, 2-10, J, Q, K
 */
function Card( suit , value ) {
	this.visible = true;
	this.selected = false;
	this.vertical = true;
	this.suit = suit;
	this.value = value;
	
	this.faceImageFile = getImageFileOfCard( this );
	this.faceImg = document.createElement( "img" );
	this.faceImg.setAttribute( "src" , this.faceImageFile );
	this.faceImg.setAttribute( "class" , "vCard" );
	
	this.backImageFile = "res/b1fv.png";
	this.backImg = document.createElement( "img" );
	this.backImg.setAttribute( "src" , this.backImageFile );
	this.backImg.setAttribute( "class" , "vCard" );
	
	var thisCard = this;
	
	this.clone = function() {
		var rtn = new Card( this.suit , this.value );
		rtn.visible = this.visible;
		rtn.selected = this.selected;
		rtn.vertical = this.vertical;
		return rtn;
	}
	
	this.setSelected = function( bool ) {
		thisCard.selected = bool;
		
		if ( !thisCard.selected ) {
			if ( thisCard.vertical ) {
				thisCard.faceImg.setAttribute( "class" , "vCard" );
			}
			else {
				thisCard.faceImg.setAttribute( "class" , "hCard" );
			}
		}
		else {
			if ( thisCard.vertical ) {
				thisCard.faceImg.setAttribute( "class" , "vSelectedCard" );
			}
			else {
				thisCard.faceImg.setAttribute( "class" , "hSelectedCard" );
			}
		}
	}
	
	this.toggleSelected = function() {
		thisCard.setSelected( !thisCard.selected );
	}
	
	this.faceImg.onclick = function() {
		thisCard.toggleSelected();
	};
	
	this.toggleSelection = function( bool ) {
		if ( bool ) {
			this.faceImg.onclick = this.toggleSelected;
		}
		else {
			this.faceImg.onclick = undefined;
		}
	}
	
	this.setZIndex = function( idx ) {
		this.faceImg.style.zIndex = idx;
		this.backImg.style.zIndex = idx;
	}
	
	this.setOffset = function( pixels ) {
		if ( this.vertical ) {
			thisCard.faceImg.style.left = pixels + "px";
			thisCard.backImg.style.left = pixels + "px";
		}
		else {
			thisCard.faceImg.style.top = pixels + "px";
			thisCard.backImg.style.top = pixels + "px";
		}
	};
	
	this.getImage = function() {
		if ( this.visible ) {
			return this.faceImg;
		}
		else {
			return this.backImg;
		}
	}
	
	this.setVertical = function( bool ) {
		this.vertical = bool;
		if ( this.vertical ) {
			this.faceImgFile = getImageFileOfCard( this );
			this.faceImg.setAttribute( "class" , "vCard" );
			this.backImgFile = "res/b1fv.png";
			this.backImg.setAttribute( "class" , "vCard" );
		}
		else {
			this.faceImgFile = getImageFileOfCard( this );
			this.faceImg.setAttribute( "class" , "hCard" );
			this.backImgFile = "res/b1fh.png";
			this.backImg.setAttribute( "class" , "hCard" );
		}
		this.faceImg.setAttribute( "src" , this.faceImgFile );
		this.backImg.setAttribute( "src" , this.backImgFile );
	}
	
	this.setVisible = function( bool ) {
		this.visible = bool;
	}
	
	this.compareToByValue = function( card ) {
		var thisValue = this.value;
		
		//account for the fact that aces are larger than everything else
		if ( thisValue == 1 ) {
			thisValue += 13;
		}
		
		var otherValue = card.value;
		if ( otherValue == 1 ) {
			otherValue += 13;
		}
		
		return thisValue - otherValue;
	}
	
	this.compareTo = function( card ) {
		if ( this.suit != card.suit ) {
			return this.suit - card.suit;
		}
		else {
			return this.compareToByValue( card );
		}
	}
	
	this.compareToByLevel = function( card , level ) {
		if ( this.value == level || card.value == level ) {
			if ( this.value == level && card.value != level ) {
				if ( card.suit > 4 ) {
					return -1;
				}
				else {
					return 1;
				}
			}
			else if ( this.value != level && card.value == level ) {
				if ( this.suit > 4 ) {
					return 1;
				}
				else {
					return -1;
				}
			}
			else {
				return this.suit - card.suit;
			}
		}
		else {
			return this.compareTo( card );
		}
	}
	
	this.compareToByDeclared = function( card , level , declaredSuit ) {

		//check jokers
		if ( this.suit > 4 ) {
			return this.suit - card.suit;
		}
		
		//check if the card's value is of the current level
		if ( this.value == level ) {
			if ( card.suit > 4 ) {
				return -1;
			}
			if ( card.value == level ) {
				if ( this.suit == declaredSuit && card.suit != declaredSuit ) {
					return 1;
				}
				else if ( this.suit != declaredSuit && card.suit == declaredSuit ) {
					return -1;
				}
				else {
					return this.suit - card.suit;
				}
			}
			return 1;
		}
		
		if ( this.suit == declaredSuit ) {
			if ( card.suit > 4 || card.value == level ) {
				return -1;
			}
			if ( card.suit == declaredSuit ) {
				return this.compareToByValue( card );
			}
			return 1;
		}
		
		if ( card.suit == declaredSuit ) {
			return -1;
		}
		return this.compareToByLevel( card , level );
	}
	
	/**
	 * Compares this card to another card assuming that the other card
	 * was played before this card.
	 * 
	 * @return 0 or -1 if this card is "less than" the card with which we
	 * compare, and 1 if this card is "greater than" the other card.
	 */
	this.compareToWithPlayOrder = function( card , level , declaredSuit ) {
		if ( this.suit > 4 ) {
			return this.suit - card.suit;
		}
		
		//check if the card's value is of the current level
		if ( this.value == level ) {
			if ( card.suit > 4 ) {
				return -1;
			}
			if ( card.value == level ) {
				if ( this.suit == declaredSuit && card.suit != declaredSuit ) {
					return 1;
				}
				else {
					return -1;
				}
			}
			return 1;
		}
		
		if ( this.suit == declaredSuit ) {
			if ( card.suit > 4 || card.value == level ) {
				return -1;
			}
			if ( card.suit == declaredSuit ) {
				return this.compareToByValue( card );
			}
			return 1;
		}
		
		if ( card.suit == declaredSuit ) {
			return -1;
		}
		return this.compareToByLevel( card , level );
	}
}

function CardComparatorForHands( level ) {
	this.compare = function( card1 , card2 ) {
		return -1*card1.compareToByLevel( card2 , level );
	}
}

function CardComparatorForHandsDeclared( level , declaredSuit ) {
	this.compare = function( card1 , card2 ) {
		return -1*card1.compareToByDeclared( card2 , level , declaredSuit );
	}
}

function CardComparatorForHandsDeclaredIncr( level , declaredSuit ) {
	this.compare = function( card1 , card2 ) {
		return card1.compareToByDeclared( card2 , level , declaredSuit );
	}
}

function getImageFileOfCard( card ) {
	if ( card.visible ) {
		var suit = card.suit;
		var value = String(card.value);
		if ( value.length == 1 ) {
			value = 0 + value;
		}
		if ( card.suit == 6 ) {
			return "res/j2.png";
		}
		else if ( card.suit == 5 ) {
			return "res/j1.png";
		}
		else {
			if ( suit == 1 ) {
				return "res/d" + value + ".png";
			}
			else if ( suit == 2 ) {
				return "res/c" + value + ".png";
			}
			else if ( suit == 3 ) {
				return "res/h" + value + ".png";
			}
			else if ( suit == 4 ) {
				return "res/s" + value + ".png";
			}
			else {
				return "unknown";
			}
		}
	}
	else {
		if ( card.vertical ) {
			return "res/b1fv.png";
		}
		else {
			return "res/b1fh.png";
		}
	}
}

/**
 * Creates a combined deck of two standard 54-card decks of cards.
 */
function Deck() {
	this.deck = new Array();
	for ( var suit=1 ; suit<=4 ; ++suit ) {
		for ( var value=1 ; value<=13 ; ++value ) {
			this.deck[ this.deck.length ] = new Card( suit , value );
			this.deck[ this.deck.length ] = new Card( suit , value );
		}
	}
	this.deck[ this.deck.length ] = new Card( 5 , 0 );
	this.deck[ this.deck.length ] = new Card( 5 , 0 );
	this.deck[ this.deck.length ] = new Card( 6 , 0 );
	this.deck[ this.deck.length ] = new Card( 6 , 0 );
	
	this.shuffle = function() {
		
		//swap each card with a random index
		for ( var i=0 ; i<this.deck.length ; ++i ) {
			var idxToSwapWith = Math.floor(Math.random()*this.deck.length);
			var tmp = this.deck[ idxToSwapWith ];
			this.deck[ idxToSwapWith ] = this.deck[ i ];
			this.deck[ i ] = tmp;
		}
	};
	
	this.get = function( idx ) {
		return this.deck[ idx ];
	};
	
	this.size = function() {
		return this.deck.length;
	};
	
	this.draw = function() {
		return this.deck.shift();
	}
}

/**
 * Represents a hand of cards.
 */
function Hand( verticalCards , visible ) {
	this.verticalCards = verticalCards;
	this.visible = visible;
	this.hand = new Array();
	
	this.clone = function() {
		var rtn = new Hand( this.verticalCards , this.visible );
		for ( var i=0 ; i<this.hand.length ; ++i ) {
			rtn.addCard( this.hand[ i ] );
		}
		return rtn;
	}
	
	this.deepClone = function() {
		var rtn = new Hand( this.verticalCards , this.visible );
		for ( var i=0 ; i<this.hand.length ; ++i ) {
			rtn.addCard( this.hand[ i ].clone() );
		}
		return rtn;
	}
	
	this.subhand = function( start , end ) {
		var rtn = new Hand( this.verticalCards , this.visible );
		for ( var i=start ; i<end ; ++i ) {
			rtn.addCard( this.hand[ i ] );
		}
		return rtn;
	}
	
	this.addCard = function( card ) {
		this.hand[ this.hand.length ] = card;
	};
	
	this.get = function( idx ) {
		return this.hand[ idx ];
	}
	
	this.size = function() {
		return this.hand.length;
	}
	
	this.clear = function() {
		this.hand = new Array();
	}
	
	this.removeAt = function( idx ) {
		for ( var i=idx+1 ; i<this.hand.length ; ++i ) {
			this.hand[ i-1 ] = this.hand[ i ];
		}
		this.hand.pop();
	}
	
	this.removeCard = function( card ) {
		for ( var i=0 ; i<this.hand.length ; ++i ) {
			if ( this.hand[ i ] == card ) {
				this.removeAt( i );
				break;
			}
		}
	}
	
	this.renderOffsets = function( level , noTrump ) {
		var increment = 15;
		var startIdx = 0;
		while( startIdx < this.hand.length && 
				(this.hand[ startIdx ].value == level || 
					this.hand[ startIdx ].suit > 4 ) ) {
			++startIdx;
		}
		
		var lastOffset = -increment;
		for ( var i=0 ; i<startIdx ; ++i ) {
			lastOffset += increment;
			this.hand[ i ].setOffset( lastOffset );
		}
		
		if ( startIdx < this.hand.length ) {
			if ( noTrump && startIdx > 0 && this.visible ){
				lastOffset += increment;
			}
			
			lastOffset += increment;
			this.hand[ startIdx ].setOffset( lastOffset );
			
			for ( var i=startIdx+1 ; i<this.hand.length ; ++i ) {
				if ( this.hand[ i ].suit != this.hand[ i-1 ].suit && 
																this.visible ) {
					lastOffset += increment;
				}
				lastOffset += increment;
				this.hand[ i ].setOffset( lastOffset );
			}
		}
	}
	
	this.updateCardLayouts = function() {
		for ( var i=0 ; i<this.hand.length ; ++i ) {
			this.hand[ i ].setVisible( this.visible );
			this.hand[ i ].setVertical( this.verticalCards );
		}
	}
	
	this.updateZIndices = function() {
		for ( var i=0 ; i<this.hand.length ; ++i ) {
			this.hand[ i ].setZIndex( i );
		}
	}
	
	this.renderDealingOffsets = function( level ) {
		this.updateCardLayouts();
		this.hand.sort( (new CardComparatorForHands( 2 )).compare );
		this.renderOffsets( level , true );
		this.updateZIndices();
	}
	
	this.renderDeclaredOffsets = function( level , declaredSuit ) {
		this.updateCardLayouts();
		this.hand.sort( (new CardComparatorForHandsDeclared( level , 
				declaredSuit )).compare );
		this.renderOffsets( level , (declaredSuit > 4) );
		this.updateZIndices();
	}
	
	this.addToPanel = function( panel ) {
		for ( var i=0 ; i<this.hand.length ; ++i ) {
			panel.appendChild( this.get( i ).getImage() );
		}
	}
	
	/**
	 * 
	 * @return the number of cards with the given value and suit in this hand
	 */
	this.countCards = function( value , suit ) {
		var count = 0;
		for ( var i=0 ; i<this.hand.length ; ++i ) {
			var card = this.hand[ i ];
			if ( card.value == value && card.suit == suit ) {
				++count;
			}
		}
		return count;
	}
}

/*
var deck = new Deck();
deck.shuffle();

var hand = new Hand();
hand.visible = true;
hand.verticalCards = true;
for ( var i=0 ; i<25 ; ++i ) {
	hand.addCard( deck.get( i ) );
}
hand.renderDeclaredOffsets( 2 , 3 );

var pnlHand = document.createElement( "div" );
hand.addToPanel( pnlHand );

var handWidth = hand.get( hand.size()-1 ).getImage().style.left;
handWidth = Number( handWidth.substring( 0 , handWidth.length-2) ) + 72;
pnlHand.style.width = handWidth + "px";
pnlHand.style.left = (1000 - handWidth)/2 + "px";

var pnlHandW = document.createElement( "div" );
//hand.addToPanel( pnlHandW );

document.getElementById( "pnlSouth" ).appendChild( pnlHand );
document.getElementById( "pnlWest" ).appendChild( pnlHandW );
//*/