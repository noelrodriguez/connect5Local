//Global Variables
//Array of location objects for the board
var gameBoard;
//Array used to hold the deck
var deck;
//Array of Player objects one for each player in the game
var allPlayers = [];
//The Currently active player
var currentPlayerNumber;
//The current turn Number
var turnNumber = 0;

/*
*	Location Class and functions
*/

var Location = function() {
	var boardValue;
	var teamFilled;
	var playerFilled;
	var turnFilled;
	var cardUsed;
	//locations located around the location order: NW, N, NE, E, SE, S, SW, W
	var adjacentLocations = [];
}

//Returns an array of location objects for the board
function buildBoard() {
	var tempArray = [];
	for (var i in locationData){
		var tempLocation = new Location;
		tempLocation.boardValue = locationData[i].boardValue;
		tempLocation.adjacentLocations = locationData[i].adjacentLocations;
		tempLocation.teamFilled = -1;
		tempLocation.turnFilled = -1;
		tempLocation.playerFilled = -1;
		tempLocation.cardUsed = -1;
		tempArray.push(tempLocation);
	}
	gameBoard = tempArray;
}

/*
*	Player Class and functions
*/

var Player = function() {
	//Players Number. Determines turn order
	var playerNumber;
	//Players Team Number. Used for playing in locations on the board
	var playerTeam;
	//Players cards
	var playerHand = [];
}

//Adds a card to the players hand
function addCard(playerNumber, cardNumber){
	allPlayers[playerNumber].playerHand.push(cardNumber);
}

//Removes a card from the players hand
function removeCard(playerNumber, cardNumber){
	allPlayers[playerNumber].playerHand.remove(cardNumber);
}

//Creates players and adds them to the allPlayers array
function buildPlayers(numberOfPlayers){
	for (var i = 0; i < numberOfPlayers ; i++) {
		var tempPlayer = new Player;
		//Set Player number
		tempPlayer.playerNumber = i;
		tempPlayer.playerHand = [];
		//Set Player team by alternating
		if (i%2 == 0) {
			tempPlayer.playerTeam = 1; 
		} else {
			tempPlayer.playerTeam = 2;
		}
		allPlayers.push(tempPlayer);
	};
}

/*
*	Deck Functions
	TESTED
*/

//Builds the deck 0-99 then calls suffleDeck method on the new deck
function buildDeck(){
	var tempDeck = [];
	for (var i = 0; i < 100; i++) {
		tempDeck.push(i);
	}
	deck = shuffleDeck(tempDeck);
}

//Returns a suffled deck
function shuffleDeck(deck) {
    for (var i = deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
    return deck;
}

//Returns the card on the top of the deck
function draw(){
	return deck.pop();
}

//Deal cards at start of game
function deal(){
	//Deal 4 cards to all of the players
	for (var i in allPlayers){
		for (var j = 0; j < 4; j++) {
			addCard(i, draw());
		};
	}
}

/*
*	Board Functions
*/

//Function to prepare the board and set up the players
function newGame(numberOfPlayers){
	buildDeck();
	buildBoard();
	buildPlayers(numberOfPlayers);
	deal();
	turnNumber = 0;
	currentplayer = 0;
}

//Adds a team number to the given location 
function fillLocation(playerNumber, locationNumber, cardNumber){
	gameBoard[locationNumber].teamFilled = allPlayers[playerNumber].playerTeam;
	gameBoard[locationNumber].playerFilled = playerNumber;
	gameBoard[locationNumber].turnFilled = turnNumber;
	gameBoard[locationNumber].cardUsed = cardNumber;
}

//Returns true if there are 5 in a row
function checkWinCondition(locationNumber, teamNumber){
	//Check all four possible directions
	var NW_SE = recursiveBoardSearch(locationNumber, teamNumber, 0) + recursiveBoardSearch(locationNumber, teamNumber, 4);
	var N_S = recursiveBoardSearch(locationNumber, teamNumber, 1) + recursiveBoardSearch(locationNumber, teamNumber, 5);
	var NE_SW = recursiveBoardSearch(locationNumber, teamNumber, 2) + recursiveBoardSearch(locationNumber, teamNumber, 6);
	var W_E = recursiveBoardSearch(locationNumber, teamNumber, 3) + recursiveBoardSearch(locationNumber, teamNumber, 7);
	console.log(NW_SE +" "+ N_S +" "+ NE_SW +" "+ W_E);
	if (NW_SE >= 6 || N_S >= 6 || NE_SW >= 6 || W_E >= 6){
		return true;
	}
	return false;
}

function recursiveBoardSearch(locationNumber, teamNumber, direction){
	//if the location is not filled by the current team, return 0
	if (gameBoard[locationNumber].teamFilled !== teamNumber) {
		return 0;
	} else {
		//if it is, then check the next locaiton.
		var tempDirection = gameBoard[locationNumber].adjacentLocations[direction];
		//if the next location is undefined, it is out of the board so stop looking
		if (tempDirection == undefined) {
			return 1;
		};
		return (1 + recursiveBoardSearch(tempDirection, teamNumber, direction));
	}

}

//Returns true if location can be played based on location and card number
function canPlay(locationNumber, cardNumber){
	if (locationNumber <= cardNumber && gameBoard[locationNumber].teamFilled == -1) {
		return true;
	};
	return false;
}

//Returns the player's hand as an array
function getPlayerCards(playerNumber){
	return allPlayers[playerNumber].playerHand;
}

//Returns True if the player has less than 4 cards
function canDraw(playerNumber){
	if (allPlayers[playerNumber].playerHand.length < 4) {
		return true;
	};
	return false;
}

//Function that is called when a player plays in a location
function play_location(playerNumber, locationNumber, cardNumber){
	//Make sure that spot can be played
	if (canPlay(locationNumber, cardNumber) == false){
		return false;
	}
	//Remove the players card
	removeCard(playerNumber, cardNumber);
	//Fill the location
	fillLocation(playerNumber, locationNumber, cardNumber);
	//Check for win
	var teamNumber = allPlayers[playerNumber].teamNumber;
	if (checkWinCondition(locationNumber, teamNumber) == true){
		console.log("WIN");
	}
	return true;
}

//Function that is called when a player draws
function play_draw(playerNumber){
	//Make sure the player can draw
	if (canDraw(playerNumber) == false){
		return false;
	}
	//Draw the player a card
	addCard(playerNumber, draw());
	return true;
}

//Called after each play_draw or play_location
//advances the turnNumber and changes the currentplayer
function nextTurn(){
	turnNumber++;
	currentplayer = turnNumber % allPlayers.length;
}

/*
*	Temp functions for testing
*/

function testlocations(locationNumber){
	var tempArray = gameBoard[locationNumber].adjacentLocations;
	for (var i = 0; i < tempArray.length; i++) {
		if (tempArray[i] == null) {
			tempArray.splice(i, 1);
		}
	}
	return tempArray;
}






/*
*	locations holds the values for all board locations
*/

var locationData = [
	{"boardValue":0,"adjacentLocations":[null,null,null,null,null,99,64,65]},
	{"boardValue":1,"adjacentLocations":[13,14,15,4,3,2,11,12]},
	{"boardValue":2,"adjacentLocations":[12,1,4,3,8,9,10,11]},
	{"boardValue":3,"adjacentLocations":[1,4,5,6,7,8,9,2]},
	{"boardValue":4,"adjacentLocations":[14,15,16,5,6,3,2,1]},
	{"boardValue":5,"adjacentLocations":[15,16,35,34,33,6,3,4]},
	{"boardValue":6,"adjacentLocations":[4,5,34,33,32,7,8,3]},
	{"boardValue":7,"adjacentLocations":[3,6,33,32,31,30,29,8]},
	{"boardValue":8,"adjacentLocations":[2,3,6,7,30,29,28,9]},
	{"boardValue":9,"adjacentLocations":[11,2,3,8,29,28,27,10]},
	{"boardValue":10,"adjacentLocations":[24,11,2,9,28,27,26,25]},
	{"boardValue":11,"adjacentLocations":[23,12,1,2,9,10,25,24]},
	{"boardValue":12,"adjacentLocations":[22,13,14,1,2,11,24,23]},
	{"boardValue":13,"adjacentLocations":[21,20,19,14,1,12,23,22]},
	{"boardValue":14,"adjacentLocations":[20,19,18,15,4,1,12,13]},
	{"boardValue":15,"adjacentLocations":[19,18,17,16,5,4,1,14]},
	{"boardValue":16,"adjacentLocations":[18,17,36,35,34,5,4,15]},
	{"boardValue":17,"adjacentLocations":[61,62,63,36,35,16,15,18]},
	{"boardValue":18,"adjacentLocations":[60,61,62,17,16,15,14,19]},
	{"boardValue":19,"adjacentLocations":[59,60,61,18,15,14,13,20]},
	{"boardValue":20,"adjacentLocations":[58,59,60,19,14,13,22,21]},
	{"boardValue":21,"adjacentLocations":[57,58,59,20,13,22,55,56]},
	{"boardValue":22,"adjacentLocations":[56,21,20,13,12,23,54,55]},
	{"boardValue":23,"adjacentLocations":[55,22,13,12,11,24,53,54]},
	{"boardValue":24,"adjacentLocations":[54,23,12,11,10,25,52,53]},
	{"boardValue":25,"adjacentLocations":[53,24,11,10,27,26,51,52]},
	{"boardValue":26,"adjacentLocations":[52,25,10,27,48,49,50,51]},
	{"boardValue":27,"adjacentLocations":[25,10,9,28,47,48,49,26]},
	{"boardValue":28,"adjacentLocations":[10,9,8,29,46,47,48,27]},
	{"boardValue":29,"adjacentLocations":[9,8,7,30,45,46,47,28]},
	{"boardValue":30,"adjacentLocations":[8,7,32,31,44,45,46,29]},
	{"boardValue":31,"adjacentLocations":[7,32,41,42,43,44,45,30]},
	{"boardValue":32,"adjacentLocations":[6,33,40,41,42,31,30,7]},
	{"boardValue":33,"adjacentLocations":[5,34,39,40,41,32,7,6]},
	{"boardValue":34,"adjacentLocations":[16,35,38,39,40,33,6,5]},
	{"boardValue":35,"adjacentLocations":[17,36,37,38,39,34,5,16]},
	{"boardValue":36,"adjacentLocations":[62,63,64,37,38,35,16,17]},
	{"boardValue":37,"adjacentLocations":[63,64,99,98,97,38,35,36]},
	{"boardValue":38,"adjacentLocations":[36,37,98,97,96,39,34,35]},
	{"boardValue":39,"adjacentLocations":[35,38,97,96,95,40,33,34]},
	{"boardValue":40,"adjacentLocations":[34,39,96,95,94,41,32,33]},
	{"boardValue":41,"adjacentLocations":[33,40,95,94,93,42,31,32]},
	{"boardValue":42,"adjacentLocations":[32,41,94,93,92,43,44,31]},
	{"boardValue":43,"adjacentLocations":[31,42,93,92,91,90,89,44]},
	{"boardValue":44,"adjacentLocations":[30,31,42,43,90,89,88,45]},
	{"boardValue":45,"adjacentLocations":[29,30,31,44,89,88,87,46]},
	{"boardValue":46,"adjacentLocations":[28,29,30,45,88,87,86,47]},
	{"boardValue":47,"adjacentLocations":[27,28,29,46,87,86,85,48]},
	{"boardValue":48,"adjacentLocations":[26,27,28,47,86,85,84,49]},
	{"boardValue":49,"adjacentLocations":[51,26,27,48,85,84,83,50]},
	{"boardValue":50,"adjacentLocations":[80,51,26,49,84,83,82,81]},
	{"boardValue":51,"adjacentLocations":[79,52,25,26,49,50,81,80]},
	{"boardValue":52,"adjacentLocations":[78,53,24,25,26,51,80,79]},
	{"boardValue":53,"adjacentLocations":[77,54,23,24,25,52,79,78]},
	{"boardValue":54,"adjacentLocations":[76,55,22,23,24,53,78,77]},
	{"boardValue":55,"adjacentLocations":[75,56,21,22,23,54,77,76]},
	{"boardValue":56,"adjacentLocations":[74,57,58,21,22,55,76,75]},
	{"boardValue":57,"adjacentLocations":[73,72,71,58,21,56,75,74]},
	{"boardValue":58,"adjacentLocations":[72,71,70,59,20,21,56,57]},
	{"boardValue":59,"adjacentLocations":[71,70,69,60,19,20,21,58]},
	{"boardValue":60,"adjacentLocations":[70,69,68,61,18,19,20,59]},
	{"boardValue":61,"adjacentLocations":[69,68,67,62,17,18,19,60]},
	{"boardValue":62,"adjacentLocations":[68,67,66,63,36,17,18,61]},
	{"boardValue":63,"adjacentLocations":[67,66,65,64,37,36,17,62]},
	{"boardValue":64,"adjacentLocations":[66,65,0,99,98,37,36,63]},
	{"boardValue":65,"adjacentLocations":[null,null,null,0,99,64,63,66]},
	{"boardValue":66,"adjacentLocations":[null,null,null,65,64,63,62,67]},
	{"boardValue":67,"adjacentLocations":[null,null,null,66,63,62,61,68]},
	{"boardValue":68,"adjacentLocations":[null,null,null,67,62,61,60,69]},
	{"boardValue":69,"adjacentLocations":[null,null,null,68,61,60,59,70]},
	{"boardValue":70,"adjacentLocations":[null,null,null,69,60,59,58,71]},
	{"boardValue":71,"adjacentLocations":[null,null,null,70,59,58,57,72]},
	{"boardValue":72,"adjacentLocations":[null,null,null,71,58,57,74,73]},
	{"boardValue":73,"adjacentLocations":[null,null,null,72,57,74,null,null]},
	{"boardValue":74,"adjacentLocations":[null,73,72,57,56,75,null,null]},
	{"boardValue":75,"adjacentLocations":[null,74,57,56,55,76,null,null]},
	{"boardValue":76,"adjacentLocations":[null,75,56,55,54,77,null,null]},
	{"boardValue":77,"adjacentLocations":[null,76,55,54,53,78,null,null]},
	{"boardValue":78,"adjacentLocations":[null,77,54,53,52,79,null,null]},
	{"boardValue":79,"adjacentLocations":[null,78,53,52,51,80,null,null]},
	{"boardValue":80,"adjacentLocations":[null,79,52,51,50,81,null,null]},
	{"boardValue":81,"adjacentLocations":[null,80,51,50,83,82,null,null]},
	{"boardValue":82,"adjacentLocations":[null,81,50,83,null,null,null,null]},
	{"boardValue":83,"adjacentLocations":[81,50,49,84,null,null,null,82]},
	{"boardValue":84,"adjacentLocations":[50,49,48,85,null,null,null,83]},
	{"boardValue":85,"adjacentLocations":[49,48,47,86,null,null,null,84]},
	{"boardValue":86,"adjacentLocations":[48,47,46,87,null,null,null,85]},
	{"boardValue":87,"adjacentLocations":[47,46,45,88,null,null,null,86]},
	{"boardValue":88,"adjacentLocations":[46,45,44,89,null,null,null,87]},
	{"boardValue":89,"adjacentLocations":[45,44,43,90,null,null,null,88]},
	{"boardValue":90,"adjacentLocations":[44,43,92,91,null,null,null,89]},
	{"boardValue":91,"adjacentLocations":[43,92,null,null,null,null,null,90]},
	{"boardValue":92,"adjacentLocations":[42,93,null,null,null,91,90,43]},
	{"boardValue":93,"adjacentLocations":[41,94,null,null,null,92,43,42]},
	{"boardValue":94,"adjacentLocations":[40,95,null,null,null,93,42,41]},
	{"boardValue":95,"adjacentLocations":[39,96,null,null,null,94,41,40]},
	{"boardValue":96,"adjacentLocations":[38,97,null,null,null,95,40,39]},
	{"boardValue":97,"adjacentLocations":[37,98,null,null,null,96,39,38]},
	{"boardValue":98,"adjacentLocations":[64,99,null,null,null,97,38,37]},
	{"boardValue":99,"adjacentLocations":[65,0,null,null,null,98,37,64]}
];