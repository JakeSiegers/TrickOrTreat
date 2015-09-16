var mysql = require('mysql');
var ChanceJS = require('chance');
var chance = new ChanceJS();

function TreatDatabase(TrickOrTreatOBJ){
	this.trt = TrickOrTreatOBJ;
}

TreatDatabase.prototype.initDatabaseConnection = function(callback){
	this.dbc = mysql.createConnection(this.trt.config.mysql);
	this.dbc.connect(this.initDatabaseConnectionConnected.bind(this,callback));
	this.dbc.on('error',this.trt.error.bind(this.trt));
};

TreatDatabase.prototype.initDatabaseConnectionConnected = function(callback,error){
	if(error !== null){ this.trt.error(error); return;}
	callback();
};

// ===========================
// ACTUAL QUERY FUNCTIONS
// ===========================
TreatDatabase.prototype.getPlayerById = function(playerId,callback){
	this.dbc.query('SELECT playerId,playerName,lastPlayed,numPlayedToday FROM players WHERE playerId = ?',[playerId],callback);
}

TreatDatabase.prototype.insertPlayer = function(playerId,playerName,callback){
	this.dbc.query('INSERT INTO players SET playerId = ? , playerName = ? , lastPlayed = NOW()',[playerId,playerName],callback);
}

TreatDatabase.prototype.giveUserCandies = function(userObj,candies,callback){
	//load up on candies!
	var candiesAlreadyHave = {}
	var searchParams = new Array();
	var searchAndStr = "";
	searchParams.push(userObj.id);
	for(var i=0;i<candies.length;i++){
		var candyId = candies[i].candyId;
		searchParams.push(candyId);
		candiesAlreadyHave[candyId] = false;
		if(i>0){
			searchAndStr += " OR candyId=?";
		}else{
			searchAndStr += "WHERE playerId =? AND (candyId=?";
		}
		
	}
	searchAndStr +=")";

	var sThis = this;

	//ADD A TRANSACTION TO THIS QUERY!
	//MAYBE DO THIS QUERY ALL AT ONCE? - this sounds good.
	//Multiple statement queries
	//Would fix issues of errors firing and breaking stuff - that's what the transactions are for!

	//update play count!
	this.dbc.query('UPDATE players SET lastPlayed=NOW(),numPlayedToday = numPlayedToday+1 WHERE playerId=?',[userObj.id],function(error,results,fields){
		if(error !== null){sThis.trt.error(error); return;}
	});

	var getCurrentCandiesQuery = 'SELECT playerCandyId,candyId,playerId,amount FROM playercandies '+searchAndStr;
	//console.log(getCurrentCandiesQuery);
	this.dbc.query(getCurrentCandiesQuery,searchParams,function(error,results,fields){
		if(error !== null){sThis.trt.error(error); return;}

		//player already has candy!
		for(var i=0;i<results.length;i++){
			candiesAlreadyHave[results[i].candyId] = true;
			sThis.dbc.query('UPDATE playercandies SET amount=? WHERE playerCandyId=?',[results[i].amount+1,results[i].playerCandyId],function(error,results,fields){
				if(error !== null){sThis.trt.error(error); return;}
			});
		}

		//insert new candies for candies that do not exist in player inventory.
		for (var candyId in candiesAlreadyHave){
			if(!candiesAlreadyHave[candyId]){
				sThis.dbc.query('INSERT INTO playercandies SET candyId=?,playerId=?,amount=1',[candyId,userObj.id],function(error,results,fields){
					if(error !== null){sThis.trt.error(error); return;}
				});
			}
		}
	});

	//Yeah, this callback fires instantly, even though the query above may not have fired yet.
	//We need to adjust this!
	callback();
}


TreatDatabase.prototype.getAllCandies = function(callback){
	this.dbc.query('SELECT candyId,candyName,candyIcon FROM candies',[],callback);
}

TreatDatabase.prototype.getCandyCountOfPlayer = function(playerId,callback){
	this.dbc.query('SELECT playerCandyId,playercandies.candyId,playerId,amount,candyName,candyIcon FROM playercandies LEFT JOIN candies ON candies.candyId = playercandies.candyId WHERE playerId = ? ',[playerId],callback);
}

TreatDatabase.prototype.resetCooldowns = function(callback){
	this.dbc.query('UPDATE players SET numPlayedToday=0',callback);
}

module.exports = TreatDatabase;