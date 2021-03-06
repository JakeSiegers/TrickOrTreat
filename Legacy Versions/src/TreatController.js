var ChanceJS = require('chance');
var chance = new ChanceJS();

function TreatController(TrickOrTreatOBJ){
	this.trt = TrickOrTreatOBJ;
}

// ================= REGISTER USER ============================================================

TreatController.prototype.registerCheckUserExists = function(userObj,callback,error,results,fields){
	if(error !== null){ this.trt.error(error); return;}
	if(results.length > 0){
		callback(userObj.name+", you're *already* registered! You don't need to register twice, silly!");
		return;
	}else{
		this.trt.database.insertPlayer(userObj.id,userObj.name,this.registerFinish.bind(this,userObj,callback));
	}
};

TreatController.prototype.registerFinish = function(userObj,callback,error,results,fields){
	if(error !== null){ this.trt.error(error); return;}
	callback(userObj.name+", Welcome to Trick or Treat! Type \"!trt help\" to learn how to use me, or type \"!trt\" again to start playing!");
	return;
};

// ==========================================================================================

TreatController.prototype.goTrickOrTreating = function(userObj,callback){
	this.trt.database.getPlayerById(userObj.id,this.checkUserCanPlay.bind(this,userObj,callback));
};

TreatController.prototype.checkUserCanPlay = function(userObj,callback,error,results,fields){
	if(error !== null){ this.trt.error(error); return;}

	if(results.length > 0){
		var numPlayedToday = results[0].numPlayedToday;
		if(numPlayedToday >= 2){
			var timeTillReset = this.trt.timeTillDayReset();
			callback(userObj.name+": "+chance.pick(this.trt.treatStrings.alreadyPlayed)+"\n(Day resets in "+timeTillReset.hoursStr+" "+timeTillReset.minutesStr+")");
			return;
		}
		this.userCanPlay(userObj,callback);
	}else{
		//User doesn't exist, let's register them!
		this.trt.database.getPlayerById(userObj.id,this.registerCheckUserExists.bind(this,userObj,callback));
		return;
	}
};

TreatController.prototype.userCanPlay = function(userObj,callback){
	//This is where you can choose what actually happens in the game, like events or whatnot.
	//For now we'll jusy assume you're rolling for candy, and play for candy.

	//Instead of hardcoding this, preload all events, and actualy make this cool.
	//Convert the candy giving into an "event"
	//All outcomes of TRT will be in seperate files (except for general stuff like REGISTER )
	if(chance.bool({likelihood: 1})){
		var sugarRush = require('./events/sugarRush.js');
		new sugarRush(this.trt,userObj,callback);
	}else{
		//Normal candyevent.
		this.trt.database.getAllCandies(this.giveUserCandies.bind(this,userObj,callback));
	}
	
};



TreatController.prototype.giveUserCandies = function(userObj,callback,error,results,fields){
	if(error !== null){ this.trt.error(error); return;}

	if(results.length === 0){
		//There's no candy in the database!
		this.trt.log("warning","No candy in the database to give out!");
		callback("I have no candies to give!\n(Did an admin forget to fill up the candy database?)");
		return;
	}

	var amount = 1;
	if(Math.floor(Math.random()*25) === 0){
		amount = 2;
	}
	if(Math.floor(Math.random()*50) === 0){
		amount = 3;
	}

	var candiesGiven = [];
	for(var i=0;i<amount;i++){
		candiesGiven.push(results[chance.natural({min: 0, max: results.length-1})]);
	}

	this.trt.database.giveUserCandies(userObj,candiesGiven,this.giveUserCandiesConfirm.bind(this,userObj,candiesGiven,callback));
};

TreatController.prototype.giveUserCandiesConfirm = function(userObj,candiesGiven,callback){

	var candyStr = "";
	for(var i=0;i<candiesGiven.length;i++){
		candyStr += (i>0?'*AND* ':'')+'one '+candiesGiven[i].candyIcon+' '+candiesGiven[i].candyName+"\n";
	}

	if(candiesGiven.length >= 3){
		callback("Overflowing Bucket! Jackpot! A house has some extra, so you get "+candiesGiven.length+" candies! \n"+userObj.name+" you received "+candyStr);
	}else{
		callback(userObj.name+", you received "+candyStr);
	}
};

// ==========================================================================================

TreatController.prototype.generateLeaderboard = function(callback){
	this.trt.database.getPlayerCandyTopTen(this.returnGenerateLeaderboard.bind(this,callback));
};

TreatController.prototype.returnGenerateLeaderboard = function(callback,error,results,fields){
	if(error !== null){ this.trt.error(error); return;}

	if(results.length === 0){
		callback("No one has any candy");
		return false;
	}
	var candyTable=[];
	for(var i=0;i<results.length;i++){
		//candyTable+=(results[i].amount>=1000?'*a boatload of*':results[i].amount)+" "+results[i].candyIcon+" "+results[i].candyName+"\n"
		candyTable.push({
			//"title":,
			"value":"#"+(i+1)+": "+results[i].playerName+" = "+results[i].total,
			"short":false
		});
	}
	callback("Top 10 Players:",[{"color": "#f1952a",title:"",fields:candyTable}]);
};

// ==========================================================================================



// ==========================================================================================

TreatController.prototype.showPlayerRank = function(playerObj,callback){
	this.trt.database.getPlayerRank(playerObj.id,this.returnShowPlayerRank.bind(this,callback));
};

TreatController.prototype.returnShowPlayerRank = function(callback,error,results,fields){
	if(error !== null){ this.trt.error(error); return;}

	if(results.length === 0){
		callback("I don't know who you are!");
		return false;
	}

	callback(results[0].playerName+", is rank "+results[0].rank+" with "+results[0].total+" "+this.trt.pluralize("candy",results[0].total));
};

// ==========================================================================================


TreatController.prototype.generateCandyCountAttachment = function(userObj,callback){
	this.trt.database.getCandyCountOfPlayer(userObj.id,this.returnCandyCountAttachment.bind(this,userObj,callback));
};

TreatController.prototype.returnCandyCountAttachment = function(userObj,callback,error,results,fields){
	if(error !== null){ this.trt.error(error); return;}

	if(results.length === 0){
		callback(userObj.name+", you don't have any candy! Go get some with !trt");
		return false;
	}
	var candyTable=[];
	for(var i=0;i<results.length;i++){
		//candyTable+=(results[i].amount>=1000?'*a boatload of*':results[i].amount)+" "+results[i].candyIcon+" "+results[i].candyName+"\n"
		candyTable.push({
			//"title":,
			"value":results[i].amount+" "+results[i].candyIcon+" "+results[i].candyName,
			"short":true
		});
	}
	callback(userObj.name+", you have:",[{"color": "#f1952a",title:"",fields:candyTable}]);
};


module.exports = TreatController;
