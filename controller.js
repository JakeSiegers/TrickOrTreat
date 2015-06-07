function TOTController(){
	this.model = require('./model');
	
}

TOTController.prototype.help = function(){

}

TOTController.prototype.addCandy = function(name){
	this.model.addCandy(name);
}

TOTController.prototype.parseMessage = function(message){
	//very basic, doesnt count for escaped characters - just basic quoting.
	return message.match(/'[^']*'|"[^"]*"|\S+/g) || [];
}

TOTController.prototype.trickortreat = function(username){
	return {success:false,error:"Can't Trick or Treat yet!"};
	/*
	var msg = "";

	this.model.getPlayerCandies(username);

	if(players[user.id] == null){
		players[user.id] = 0;
		return "Hello "+user.name+", Lets's play! You start with 0 candies!";
	}

	var selection = Math.floor(Math.random()*1000)+1;
	if(selection>950){
		return user.name+", you found a "+nonCandies[Math.floor(Math.random()*nonCandies.length)]+"... You still have "+players[user.id]+" candies.";
	}

	candiesFound = 1;
	var candiesFoundChance = Math.floor(Math.random()*100)+1;
	if(candiesFoundChance<15){
		candiesFound = 2;
	}else if(candiesFoundChance<3){
		candiesFound = 3;
	}
	players[user.id] += candiesFound;
	return user.name+", you found "+candiesFound+" "+candies[Math.floor(Math.random()*candies.length)]+"! You now have "+players[user.id]+" candies!")
	*/
}

TOTController.prototype.giveCandy = function(num,candy,player){
	return {success:false,error:"Can't give candy yet!"};
	/*
	if(!isNumeric(num)){
		channel.send("Candy Count must be numeric");
		return false;
	}
	*/

	//check to ensure you have candies
	//check user exists
	//pass candies
	//subtract candies

	
	//channel.send("Giving "+msgArray[1]+" "+msgArray[2]+" to @"+msgArray[3]);
	//return true;
}

//helper function
function isNumeric(numeric){
	return !isNaN(parseFloat(n) && isFinite(n)
}

module.exports = new TOTController