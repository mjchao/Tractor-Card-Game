# Tractor (Card Game)

Running the Application
===
To run this application, you can download the entire project as a zip using the Github website. Uncompress the project and then load WebContent/game.html in Chrome. This majority of this application has been tested in Chrome v. 42.0.2311.135 m. Much of it has also been tested in Internet Explorer and Firefox, but I have not yet had the time to test this extensively in browsers other than Chrome. 

Comments
===

This is a fun experiment with Javascript, HTML and CSS. Most of the code ended up being Javascript and only a little bit is HTML and CSS. The program was built bottom-up, and I did not find any major design issues during integration. The most difficult aspect was writing the code to enforce the rules of dumping cards in tractor. There were a lot of unusual cases, and subtle bugs escaped unit testing into system testing. Luckily though, the algorithms turned out well-designed and logically-written.

In its current stage, all that remains to do is to create an AI capable of playing the game. Currently, the AI only handles tricks with 1 card by selecting a random card of the correct suit to play. Ideally, it would be able to handle tricks with varying amounts of cards and play intelligently. Since I will be taking a course in artificial intelligence next semester (Fall 2015), I may return to this project then.

Background
===

This card game is not too well known around the world. It is mainly played in China. The Chinese name for this game literaly translates to "Tractor."

Tractor is played with two standard decks of cards with jokers. There are two teams of two people: north-south and east-west. There are thirteen *levels* corresponding to the thirteen card values: 2, 3, ... 10, J, Q, K, A. Both teams start at level 2 and want to be the first team to successfully pass level A. The team that finishes level A first wins.

Rules
===

For a beginner, Tractor can be a very complicated game with many rules. The following sections attempt to explain all the rules in a logical progression.

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
Within an individual suit, the rank of the cards from highest to lowest is A-K-Q-J-10-9-8-7-6-5-4-3-2. As beat everything else, Ks beat everything but As, etc. If two cards of the same suit and value are played, the one played first wins.

##Dumping
If you are first person to play during a trick and you are certain that some set of cards you have when broken into individual combinations cannot be beaten by any other hand, you may *dump* all of them at once. For example, if you have A-K-K of spades, you can dump them because A is the highest single card in its suit, and K-K is the highest possible pair (since you already have one of the As, you know there cannot be a pair of As in another hand). Therefore, you may dump these three cards.

If your estimations are incorrect and your dump is invalid (i.e. your cards can be beaten), then you must play the smallest combination that can be beaten as a penalty. For example, if you attempt to dump A-Q-Q, but somebody has a pair of Ks, then you will be required to play the pair of Qs. As another example, if you attempt to dump 2-2-3 of spades and another hand has 4-4-5 of spades, you will be required to play the 3 of spades, as single cards are the weakest combination.

##Following a Dump
You must also follow the combinations and suit of a dump when possible. If the dump has one tractor, you are obliged to play one tractor if you can. If you cannot, then you must substitute with four cards of the same suit. If you run out of cards to substitute in the suit, you may substitute with cards from any other suit. Similarly, if the dump has three singles and two pairs, you must try to play three singles and two pairs in the same suit. If you cannot, then you must substitute with other cards in that suit. If your suit is cleared, you may substitute with any cards you choose from other suits.

##Rounds
In order for a team to pass a level, it must successfully defend a *round* for that level. The defending team members are called the *defenders* and the other two players are called the *attackers*. To successfully defend a round, the defenders must prevent the attackers from scoring 80 points. The point scoring system will be explained shortly.

##Tricks and Points
In each round, some tricks will be played. The player who wins the trick will win all the cards played in that trick for his/her team. The mechanics of winning a trick will be explained shortly. 

All 5s are worth 5 points, all 10s are worth 10 points, and all Ks are worth 10 points. If the attackers win any 5s, 10s, or Ks, the point values are added to their score. If the defenders win any 5s, 10s, or Ks, they simply prevent the attackers from obtaining those points. If a card is not a 5, 10, or K, it is worth 0 points and does not really matter with respect to the scoring system.

##Dealing
Players take turns drawing cards one at a time in a counter-clockwise order. In every round, there will be a *leading defender* who will draw the first card. Once one hundred cards have been drawn, the dealing stops. The leading defender also gets to lead the first trick.

##Bottom
The remaining eight cards not dealt are called the *bottom*. These cards are seen only by the leading defender. The leading defender may add these eight cards to his/her hand. S/he must then create his/her own bottom with any eight cards from his/her hand. The leading defender can put cards in the original bottom back into his/her modified bottom. After the leading defender has confirmed his/her selection of cards in the bottom, the cards are removed from play.

##Winning the Bottom
Whoever wins the last trick *wins the bottom.* If the defenders win the bottom, then nothing happens. If the attackers win the bottom, there is a point penalty for the defenders equivalent to the number of points in the bottom times two to the power of the number of cards played in the last trick. For example, if the bottom had five points and the attackers won the last trick with two cards, they would gain an additional twenty points.

##Trumps
If at any point you are void of a suit, you may use *trump* cards to win a trick. The trump suit is determined while dealing. To trump some cards, you must play a hand that has the same combinations as the non-trump suit, except with trump suit cards. For example, if somebody played a pair of Js, you would have to use a trump pair to beat it. Any trump pair, however, will work, such as a pair of 4s, although the 4s are lower than the Js. 

##Determining the Trump Cards
The four jokers (two big and two small) are always trump cards. They are higher in power than every other card. In addition, for each level, the cards of that level are automatically promoted to trump status. These cards are called the *dominant* cards. For example, if team North-South were defending on level 3, all 3s would automatically become dominant cards. Only jokers can beat the dominant cards, and all dominant cards are of the same power (i.e. whichever one played first in a trick wins), with one exception, that will be stated later.

Below the dominant cards are the normal cards of the trump suit. The trump suit is determined by *declaring* during the dealing phase. As cards are being dealt, any player may at any point choose to declare a suit as trump suit by showing the dominant card of that suit. For example, if the level was 3 and you noticed your hand had many spades, you would hope for a 3 of spades. When you get one of the 3 of spades, you would show it to everyone. Note that once someone has declared a trump suit, nobody else can declare again.

If you happen to come across a pair of dominant cards of one suit, you have the option of *overriding*. By showing your pair of dominant cards, you may override a previously declared trump suit. For example, if a member of the other team declared diamonds, and you came across a pair of dominant spades, you could override the diamonds and change the trump suit to spades by showing your pair. Once somebody has overriden, nobody else can override again. Note that there does not have to be a declaration before overriding. You may choose to immediately show a pair of dominant cards if you really want a certain trump suit.

The last trump-affecting event is a pair of jokers. If you obtain a pair of jokers (either both big or both small), you may show them to declare no-trump. This can be done even if someone has overridden the trump suit. If no-trump is played, then there is no trump suit and the only cards that may be used to trump are the dominant cards and jokers. You are welcome to show a pair of big jokers if a pair of small jokers have already been shown; however, once no-trump has been declared, the round cannot revert back to having a trump suit. 

If there is no trump suit, then all dominant cards are of the same power. If there is a trump suit, then the dominant card of that trump suit becomes more powerful than dominant cards of a non-trump suit. This is the one catch that was mentioned in the first paragraph.

##Trumping and Over-Trumping a Dump
If somebody dumps some cards, and multiple players wish to trump it, the rules of determining the winner are as follows: 1) If the dump contained a tractor(s), whomever plays some trumps with the highest tractor wins. 2) If the dump contained no tractors, but it contained pairs, whomever plays some trumps with the highest pair wins. 3) If the dump contained no tractors or pairs, it must contain single cards, and whomever plays some trumps with the higest single card wins. 

For example, suppose somebody dumped 6-6-7-8-9-9 of a non-trump suit. Suppose player 1 trumps with 3-3-5-5-8 and player 2 trumps with 2-2-7-10-10. Player 2 wins the competition because his pair of 10s is the highest pair. It does not matter that his pair of 2s was lower than player 1's pair of 3s, or that player 2's 7 was lower than player 1's 8. Only the highest matters.

##Starting the First Round
An attentive reader may be wondering about the mechanics of the first round, as the defenders have not been determined. Typically, the game begins by selecting a random card from the deck and taking its remainder whend divided by 4 to determine who draws first. If the remainder is 1, the person who selected the card draws first. If it is 2, the person 1 spot counterclockwise from the person who selected the card draws first, and so on. For example, if the south player picks a random card, J (11), and takes its value modulo 4, s/he would get 3. This corresponds to the person two spots counterclockwise down, which would be the north player.

Once the person who draws first has been determined, drawing begins. As players draw their cards, the first person to flip a dominant card becomes the lead defender. Although the declarer takes the risk that the suit is not an ideal trump suit, s/he will receive the bottom and begins with an advantage. If the declarer is overriden, either by a pair of dominant cards or by a pair of jokers, s/he loses the bottom and possibly the defending position (if the other team overrides) to whoever just overrode.

##After the First Round
If a defending team succeeds in defending, the lead defender title is transferred to the current lead defender's teammate. If a defending team loses, the lead defender title is transferred to the attacker who is directly counter-clockwise from the current lead defender.
