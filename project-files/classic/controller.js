var _this = null;

function TOTController(){
	_this = this;
	this.config = require('./config');
	this.mysql = require('mysql');
	this.Q  = require('q');
	this.Q.longStackSupport = true;
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
	_this.channel.send("FATAL ERROR!\nTrick Or Treat is going offline for now\nping @"+this.config.userToPingOnCrash);
	throw new Error("Error Occured: "+error.message);
}

TOTController.prototype.setChannel = function(c){
	_this.channel = c;
}

TOTController.prototype.resetCooldowns = function(){
	_this.dbc.query('UPDATE players SET numPlayedToday=0',function(error,results,fields){
		if(error != null){_this.fatalError(error);}
	});
}


TOTController.prototype.help = function(){

}

TOTController.prototype.addCandy = function(){
/*
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
		var emote = candies[i];
		var s = emote;
		s+=" -> ";
		emote = emote.toLowerCase();
		s+= emote;
		s+=" -> ";
		emote = emote.replace(/\s/g,"");
		s+= emote;
		s+=" -> ";
		emote = emote.replace(/-/g,"");
		s+= emote;
		s+=" -> ";
		emote = emote.replace(/'/g,"");
		s+= emote;
		s+=" -> ";
		emote = ":"+emote+":";
		s+= emote;

		//_this.channel.send(s);

		var c ={candyName:candies[i],candyIcon:emote,nonCandy:false};
		_this.dbc.query('INSERT INTO candies SET ?',c,function(error,results,fields){
			if(error){_this.fatalError(error);}
			//_this.channel.send("+1 Candy Added!");
		});
	}
	*/
}

TOTController.prototype.parseMessage = function(message){
	//very basic, doesnt count for escaped characters - just basic quoting.
	var params = message.match(/'[^']*'|"[^"]*"|\S+/g) || [];
	for(var i=0;i<params.length;i++){
		params[i] = params[i].replace(/"/g, "");
	}
	return params;
}

TOTController.prototype.register = function(slackUserId,slackName){
	_this.dbc.query('SELECT playerId,playerName,lastPlayed FROM players WHERE playerId = ?',[slackUserId],function(error,results,fields){
		if(error != null){_this.fatalError(error);}
		if(results.length > 0){
			_this.channel.send(slackName+", You're already registered!");
		}
		else{
			_this.dbc.query('INSERT INTO players SET playerId = ? , playerName = ? , lastPlayed = NOW()',[slackUserId,slackName],function(error,results,fields){
				if(error){_this.fatalError(error);}
				_this.channel.send("Hello "+slackName+"! You've been registered!");
			});
		}
	});
	
}

TOTController.prototype.trickortreat = function(slackUserId,slackName){
	//return {success:false,error:"Can't Trick or Treat yet!"};

	_this.dbc.query('SELECT playerId,playerName,lastPlayed,numPlayedToday FROM players WHERE playerId = ?',[slackUserId],function(error,results,fields){
		if(error != null){_this.fatalError(error);}
		if(results.length == 0){
			_this.channel.send("You need to register first! (!trt register)");
			return false;
		}
		var numPlayedToday = results[0].numPlayedToday;
		if(numPlayedToday >= 2){
			_this.channel.send("You've alrady Trick or Treated twice today! (Day resets at midnight, central standard time)");
			return false;
		}

		var amount = 1;
		if(Math.floor(Math.random()*25) == 0){
			amount = 2;
		}
		if(Math.floor(Math.random()*50) == 0){
			amount = 3;
		}
		
		_this.dbc.query('SELECT candyId,candyName,candyIcon FROM candies ORDER BY RAND() LIMIT ?',[amount],function(error,results,fields){
			if(error){_this.fatalError(error);}
			//_this.channel.send("You're registered! {This is where i'd give you some candy from the database...}");
			//_this.channel.send();
			var candyStr = "";
			var candiesFound = results;
			if(candiesFound.length == 0){
				_this.channel.send("I have no candies to give!\n(Did an admin forget to fill up the candy database?)");
				return false;
			}
			for(var i=0;i<candiesFound.length;i++){
				candyStr += (i>0?'*AND* ':'')+'one '+candiesFound[i].candyIcon+' '+candiesFound[i].candyName+"\n"
			}
			if(candiesFound.length >= 3){
				_this.channel.send("Overflowing Bucket! Jackpot! A house has some extra, so you get "+candiesFound.length+" candies! \n"+slackName+" you received "+candyStr);
			}else{
				_this.channel.send(slackName+", you received "+candyStr);
			}
			numPlayedToday++;
			//update play count!
			_this.dbc.query('UPDATE players SET lastPlayed=NOW(),numPlayedToday=? WHERE playerId=?',[numPlayedToday,slackUserId],function(error,results,fields){
				if(error){_this.fatalError(error);}
			});

			//load up on candies!
			var candiesAlreadyHave = {}
			var searchParams = new Array();
			var searchAndStr = "";
			searchParams.push(slackUserId);
			for(var i=0;i<candiesFound.length;i++){
				var candyId = candiesFound[i].candyId;
				searchParams.push(candyId);
				candiesAlreadyHave[candyId] = false;
				if(i>0){
					searchAndStr += " OR candyId=?";
				}else{
					searchAndStr += "WHERE playerId =? AND (candyId=?";
				}
				
			}
			searchAndStr +=")";

			_this.dbc.query('SELECT playerCandyId,candyId,playerId,amount FROM playercandies '+searchAndStr,searchParams,function(error,results,fields){
				if(error){_this.fatalError(error);}
				/*if(results.length == 0){
					//player doesn't have candy.
					
				}else{*/
				//player already has candy!
				for(var i=0;i<results.length;i++){
					candiesAlreadyHave[results[i].candyId] = true;
					//console.log("has "+results[i].candyId);
					_this.dbc.query('UPDATE playercandies SET amount=? WHERE playerCandyId=?',[results[i].amount+1,results[i].playerCandyId],function(error,results,fields){
						if(error){_this.fatalError(error);}
					});
				}

				//insert new candies for candies that do not exist in player inventory.
				for (var candyId in candiesAlreadyHave){
					if(!candiesAlreadyHave[candyId]){
						//console.log("doesn't have "+candyId);
						_this.dbc.query('INSERT INTO playercandies SET candyId=?,playerId=?,amount=1',[candyId,slackUserId],function(error,results,fields){
							if(error){_this.fatalError(error);}
						});
					}
				}
				//}
			});
			
		});
		//console.log(fields);
	});

}

TOTController.prototype.candyCount = function(slackUserId,slackName){
	_this.dbc.query('SELECT playerCandyId,playercandies.candyId,playerId,amount,candyName,candyIcon FROM playercandies LEFT JOIN candies ON candies.candyId = playercandies.candyId WHERE playerId = ? ',[slackUserId],function(error,results,fields){
		if(error){_this.fatalError(error);}
		if(results.length == 0){
			_this.channel.send(slackName+", you don't have any candy! Go get some with !trt");
			return false;
		}
		var s=", You have:\n";
		for(var i=0;i<results.length;i++){
			s+=(results[i].amount>=1000?'*a boatload of*':results[i].amount)+" "+results[i].candyIcon+" "+results[i].candyName+"\n"
		}
		_this.channel.send(slackName+s);
	});
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

module.exports = new TOTController;