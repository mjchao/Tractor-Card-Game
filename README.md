# Tractor (Card Game)

Background
===

This card game is not too well known around the world. It is mainly played in China. The Chinese name for this game literaly translates to "Tractor", hence its name.

Tractor is played with two standard decks of cards with jokers. There are two teams of two people: north-south and east-west. There are thirteen *levels* corresponding to the thirteen card values: 2, 3, ... 10, J, Q, K, A. Both teams start at level 2 and want to be the first team to successfully pass level A. The team that finishes level A first wins.

Rules
===

For now, please see http://en.wikipedia.org/wiki/Sheng_Ji . (The Readme be updated when I get a chance.)

##Card Combinations
There are three main card combinations: tractor, pair, and single.

###Tractor
A tractor is a set of pairs of consecutive values and of the same suit. For example, 2-2-3-3 all of spades form a tractor.

###Pair
A pair is a set of two cards with the same value and suit. For example, two As of spades form a pair.

###Single
As it's name implies, a single consists of 1 card of any suit.

###Following Combination and Suit
For each trick, you must always follow the combination type and suit. For example, if the leader of the trick plays a pair of spades, you must play a pair of spades if possible. If you cannot follow the combination, you must follow the suit if possible. If you cannot follow the suit, you may play any cards you wish - you do not have to follow the combination type if you cannot follow the suit.

##Card Rankings
Within an individual suit, the rank of the cards from highest to lowest is A-K-Q-J-10-9-8-7-6-5-4-3-2. As beat everything else, Ks beat everything but As, etc. 

##Dumping
If at any time you are certain that some set of cards you have when broken into individual combinations cannot be beaten by any other hand, you may *dump* all of them at once. For example, if you have A-K-K of spades, you can dump them because A is the highest single card in its suit, and K-K is the highest possible pair (since you already have one of the As, you know there cannot be a pair of As in another hand). Therefore, you may dump these three cards.

If your estimations are incorrect and your dump is invalid (i.e. your cards can be beaten), then you must play the smallest combination that can be beaten as a penalty. For example, if you attempt to dump A-Q-Q, but somebody has a pair of Ks, then you will be required to play the pair of Qs. As another example, if you attempt to dump 2-2-3 of spades and another hand has 4-4-5 of spades, you will be required to play the 3 of spades, as single cards are the weakest combination.

##Following a Dump
You must also follow the combinations and suit of a dump when possible. If the dump has one tractor, you are obliged to play one tractor if you can. If you cannot, then you must substitute with four cards of the same suit. If you run out of cards to substitute in the suit, you may substitute with cards from any other suit. Similarly, if the dump has three singles and two pairs, you must try to play three singles and two pairs in the same suit. If you cannot, then you must substitute with other cards in that suit. If your suit is cleared, you may substitute with any cards you choose from other suits.

##Rounds
In order for a team to pass a level, it must successfully defend a *round* for that level. The defending team members are called the *defenders* and the other two players are called the *attackers*. To successfully defend a round, the defenders must prevent the attackers from scoring 80 points. The point scoring system will be explained shortly.

##Tricks and Points
In each round, some tricks will be played. The player who wins the trick will win all the cards played in that trick for his/her team. The mechanics of winning a trick will be explained shortly. 

All 5s are worth 5 points, all 10s are worth 10 points, and all Ks are worth 10 points. If the attackers win any 5s, 10s, or Ks, the point values are added to their score. If the defenders win any 5s, 10s, or Ks, they simply prevent the attackers from obtaining those points. If a card is not a 5, 10, or K, it is worth 0 points and does not really matter with respect to the scoring system.

##Dealing
Players take turns drawing cards one at a time in a counter-clockwise order. In every round, there will be a *leading defender* who will draw the first card. Once one hundred cards have been drawn, the dealing stops.

##Bottom
The remaining eight cards not dealt are called the *bottom*. These cards are seen only by the leading defender. The leading defender may add these eight cards to his/her hand. S/he must then create his/her own bottom with any eight cards from his/her hand. The leading defender can put cards in the original bottom back into his/her modified bottom. After the leading defender has confirmed his/her selection of cards in the bottom, the cards are removed from play.

##Winning the Bottom
Whoever wins the last trick *wins the bottom.* If the defenders win the bottom, then nothing happens. If the attackers win the bottom, there is a point penalty for the defenders equivalent to the number of points in the bottom times two to the power of the number of cards played in the last trick. For example, if the bottom had five points and the attackers won the last trick with two cards, they would gain an additional twenty points.
