function TOTController(){
	this.model = require('./model');
}

TOTController.prototype.addCandy = function(name){
	this.model.addCandy(name);
}

TOTController.prototype.parseMessage = function(message){
	//very basic, doesnt count for escaped characters - just basic quoting.
	return message.match(/'[^']*'|"[^"]*"|\S+/g) || [];
}

TOTController.prototype.trickortreat = function(channel,user){
	if(players[user.id] == null){
		channel.send("Hello "+user.name+", Lets's play! You start with 0 candies!")
		players[user.id] = 0;
	}

	var selection = Math.floor(Math.random()*1000)+1;
	if(selection>950){
		channel.send(user.name+", you found a "+nonCandies[Math.floor(Math.random()*nonCandies.length)]+"... You still have "+players[user.id]+" candies.")
		return;
	}

	candiesFound = 1;
	var candiesFoundChance = Math.floor(Math.random()*100)+1;
	if(candiesFoundChance<15){
		candiesFound = 2;
	}else if(candiesFoundChance<3){
		candiesFound = 3;
	}
	players[user.id] += candiesFound;
	channel.send(user.name+", you found "+candiesFound+" "+candies[Math.floor(Math.random()*candies.length)]+"! You now have "+players[user.id]+" candies!")
}

module.exports = new TOTController