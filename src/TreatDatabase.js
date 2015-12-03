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

TreatDatabase.prototype.getPlayerCandyTotals = function(callback){
	this.dbc.query('SELECT playerName,players.playerId,sum(amount) as total FROM playercandies JOIN players ON playercandies.playerId = players.playerId GROUP BY players.playerId ORDER BY total DESC',[],callback);
}

//right now there's a hard limit of only adding one of each type of candy.
//That will be updated shortly.
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

	//update play count!
	this.dbc.query('UPDATE players SET lastPlayed=NOW(),numPlayedToday = numPlayedToday+1 WHERE playerId=?',[userObj.id],function(error,results,fields){
		if(error !== null){sThis.trt.error(error); return;}
	});

	var getCurrentCandiesQuery = 'SELECT playerCandyId,candyId,playerId,amount FROM playercandies '+searchAndStr;

	this.dbc.query(getCurrentCandiesQuery,searchParams,this.giveUserCandies_updateOldCandies.bind(this,candiesAlreadyHave,userObj,callback));
}

TreatDatabase.prototype.giveUserCandies_updateOldCandies = function(candiesAlreadyHave,userObj,callback,error,results,fields){
	if(error !== null){this.trt.error(error); return;}

	var updateSql = "UPDATE playercandies SET amount = CASE playerCandyId ";
	var updateParams = [];
	var candyIdsToUpdate = [];
	for(var i=0;i<results.length;i++){
		candiesAlreadyHave[results[i].candyId] = true;

		candyIdsToUpdate.push(results[i].playerCandyId);
		updateParams.push(results[i].playerCandyId);
		updateParams.push(results[i].amount+1);
		
		updateSql += "WHEN ? THEN ? ";
	}

	updateSql += "END ";
	var inStr = "";
	for(var i=0;i<candyIdsToUpdate.length;i++){
		inStr+=candyIdsToUpdate[i];
		if(i!=candyIdsToUpdate.length-1){
			inStr+=",";
		}
	}
	updateSql += "WHERE playerCandyId IN ("+inStr+")";

	if(candyIdsToUpdate.length == 0){
		//console.log("All candy was new!");
		//Send null for error, because there was none!
		this.giveUserCandies_insertNewCandies(candiesAlreadyHave,userObj,callback,null);
	}else{
		//candy that needs to be updated before adding new candy
		//console.log(updateSql);
		this.dbc.query(updateSql,updateParams,this.giveUserCandies_insertNewCandies.bind(this,candiesAlreadyHave,userObj,callback));	
	}	
}

TreatDatabase.prototype.giveUserCandies_insertNewCandies = function(candiesAlreadyHave,userObj,callback,error,results,fields){
	if(error !== null){this.trt.error(error); return;}

	//insert new candies for candies that do not exist in player inventory.
	
	var insertSql = "INSERT INTO playercandies (candyId,playerId,amount) VALUES ";
	var insertParams = [];
	var numToInsert = 0;
	for (var candyId in candiesAlreadyHave){
		if(!candiesAlreadyHave[candyId]){
			numToInsert++;
			insertSql+= "(?,?,1),";
			insertParams.push(candyId);
			insertParams.push(userObj.id);
		}
	}
	

	if(numToInsert > 0 ){
		//remove last ,
		insertSql = insertSql.substring(0, insertSql.length - 1);

		//console.log(insertSql);

		var sThis = this;
		this.dbc.query(insertSql,insertParams,function(error,results,fields){
			if(error !== null){sThis.trt.error(error); return;}
			callback();
		});	
	}else{
		//console.log("No insert candy");
		callback();
	}
}

TreatDatabase.prototype.logData = function(fields,callback){
	/*var sThis = this;
	this.dbc.query('INSERT INTO posts SET ?',fields, function(error, result) {
		if(error !== null){sThis.trt.error(error); return;}

		callback();
		//console.log(result.insertId);
	});*/
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