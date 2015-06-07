var _this = null;

function TOTController(channel){
	_this = this;
	this.channel = channel
	this.config = require('./config');
	this.mysql = require('mysql');
	this.dbc = this.mysql.createConnection({
		host:this.config.mysqlHost
		,port:this.config.mysqlPort
		,user:this.config.mysqlUser
		,password:this.config.mysqlPass
		,database:this.config.mysqlDatabase
	});
	this.dbc.connect(function(err) {
		if(err != null){
			console.log(err.message); // 'ECONNREFUSED'
			throw new Error("Cannot connect to database, we're done here.");
		}
	});
}

TOTController.prototype.fatalError = function(error){
	console.log("===============\n=====ERROR=====\n===============\n"+error.message);
	//dbc.query('INSERT INTO ',[],function)
	_this.channel.send("ERROR! ERROR! - I'M CRASHING! - CHECK LOGS! - *COUGH*");
	throw new Error("Error Occured: "+error.message);
}

TOTController.prototype.help = function(){

}

TOTController.prototype.addCandy = function(){

	//this.channel.send("I'm not adding candies right now....");
	//return false;

	var candies = new Array(
	"Hershey's Kiss"
	,"M&Ms"
	,"Snickers"
	,"Twizzlers"
	,"Reese's Peanut Butter Cup"
	,"Kit-Kat Bar"
	,"Gummi Worms"
	,"Gummi Bears"
	,"Butterfinger"
	,"Twix"
	,"Hershey Bar"
	,"Jelly Beans"
	,"Candy Corn"
	,"Three Musketeers"
	,"Tootsie Roll"
	,"Skittles"
	,"Milky Way"
	,"Starburst"
	,"Sour Patch Kids"
	,"Almond Joy "
	,"Pixie Stix"
	,"Smarties"
	,"Blow Pop"
	,"Jolly Rancher"
	,"Red Vines"
	,"Jawbreaker"
	,"Pocky"
	,"Pop Rocks"
	,"Caramel Square"
	,"Whoppers"
	,"Gum Drops"
	,"Butterscotch"
	,"Candy Cane"
	,"Life Savers"
	,"Pez"
	,"Sweethearts"
	,"Warhead"
	,"Now and Later"
	,"Tootsie Roll Pop"
	,"Chocolate Truffle"
	);

	_this.channel.send("loading candies!");
	for(var i=0;i<candies.length;i++){
		var c ={candyName:candies[i],candyIcon:candies[i].toLowerCase().replace("/ /g","").replace("/-/g","").replace("/'/g",""),nonCandy:false};
		_this.dbc.query('INSERT INTO candies SET ?',c,function(error,results,fields){
			if(error){_this.fatalError(error);}
			_this.channel.send("+1 Candy Added!");
		});
	}
	
}

TOTController.prototype.parseMessage = function(message){
	//very basic, doesnt count for escaped characters - just basic quoting.
	return message.match(/'[^']*'|"[^"]*"|\S+/g) || [];
}

TOTController.prototype.register = function(slackUserId,slackName){
	_this.dbc.query('SELECT playerId,playerName,lastPlayed FROM players WHERE playerId = ?',[slackUserId],function(error,results,fields){
		if(results.length > 0){
			_this.channel.send(slackName+", You're already registered!");
		}
		//else{
			_this.dbc.query('INSERT INTO players SET playerId = ? , playerName = ? , lastPlayed = NOW()',[slackUserId,slackName],function(error,results,fields){
				if(error){_this.fatalError(error);}
				_this.channel.send("Hello "+slackName+"! You've been registered!");
			});
		//}
	});
	
}

TOTController.prototype.trickortreat = function(slackUserId,slackName){
	//return {success:false,error:"Can't Trick or Treat yet!"};
	

	_this.dbc.query('SELECT playerId,playerName,lastPlayed FROM players WHERE playerId = ?',[slackUserId],function(error,results,fields){
		if(error != null){
			_this.fatalError(error.message);
		}
		
		if(results.length == 0){
			_this.channel.send("You need to register first! (!trt register)");
		}else{
			_this.dbc.query('SELECT candyId,candyname,candyIcon FROM candies',function(error,results,fields){
			if(error){_this.fatalError(error);}
				_this.channel.send("You're registered! {This is where i'd give you some candy from the database...}");
			});
		}

		//console.log(fields);
	});

	
	/*
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
	return !isNaN(parseFloat(n) && isFinite(n));
}

module.exports = TOTController;