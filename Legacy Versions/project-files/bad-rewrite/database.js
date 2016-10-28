var _this = null;

function TRTDatabase(trtBot){
	_this = this;
	this.trtBot = trtBot;
	this.config = require('./config');
	this.mysql = require('mysql');
	this.dbc = this.mysql.createConnection({
		host:this.config.mysqlHost
		,port:this.config.mysqlPort
		,user:this.config.mysqlUser
		,password:this.config.mysqlPass
		,database:this.config.mysqlDatabase
	});
	this.Q  = require('q');
	this.Q.longStackSupport = true;
	this.dbc.connect(function(err) {
		if(err != null){
			console.log(err.message); // 'ECONNREFUSED'
			throw new Error("Cannot connect to database, we're done here.");
		}
	});
}

TRTDatabase.prototype.register = function(slackUserId,slackName){
	var deferred = _this.Q.defer();
	_this.dbc.query('SELECT playerId,playerName,lastPlayed FROM players WHERE playerIdsss = ?',[slackUserId],function(error,results,fields){
		if(error != null){deferred.reject(error); return false;}
		if(results.length > 0){
			deferred.resolve({success:false,error:slackName+", You're already registered!"});
		}
		else{
			_this.dbc.query('INSERT INTO players SET playerId = ? , playerName = ? , lastPlayed = NOW()',[slackUserId,slackName],function(error,results,fields){
				if(error != null){deferred.reject(error); return false;}
				deferred.resolve({success:true,message:"Hello "+slackName+"! You've been registered!"});
			});
		}
	});
	return deferred.promise;
}

TRTDatabase.prototype.TrickOrTreat = function(slackUserId,slackName){
	var deferred = _this.Q.defer();

	_this.dbc.query('SELECT playerId,playerName,lastPlayed,numPlayedToday FROM players WHERE playerId = ?',[slackUserId],function(error,results,fields){
		if(error != null){deferred.reject(error); return false;}
		if(results.length == 0){
			deferred.resolve({success:false,error:"You need to register first! (!trt register)"});
		}
		var numPlayedToday = results[0].numPlayedToday;
		if(numPlayedToday >= 2){
			deferred.resolve({success:false,error:"You've alrady Trick or Treated twice today! (Day resets at midnight, central standard time)"});
		}

		var amount = 1;
		if(Math.floor(Math.random()*25) == 0){
			amount = 2;
		}
		if(Math.floor(Math.random()*50) == 0){
			amount = 3;
		}

		_this.dbc.query('SELECT candyId,candyName,candyIcon FROM candies ORDER BY RAND() LIMIT ?',[amount],function(error,results,fields){
			if(error != null){deferred.reject(error); return false;}

			var candyStr = "";
			var candiesFound = results;
			if(candiesFound.length == 0){
				deferred.resolve({success:false,error:"I have no candies to give!\n(Did an admin forget to fill up the candy database?)"});
			}
			for(var i=0;i<candiesFound.length;i++){
				candyStr += (i>0?'*AND* ':'')+'one '+candiesFound[i].candyIcon+' '+candiesFound[i].candyName+"\n"
			}
			if(candiesFound.length >= 3){
				//_this.channel.send("Overflowing Bucket! Jackpot! A house has some extra, so you get "+candiesFound.length+" candies! \n"+slackName+" you received "+candyStr);
				deferred.resolve({success:true,message:"Overflowing Bucket! Jackpot! A house has some extra, so you get "+candiesFound.length+" candies! \n"+slackName+" you received "+candyStr});
			}else{
				//_this.channel.send(slackName+", you received "+candyStr);
				deferred.resolve({success:true,message:slackName+", you received "+candyStr});
			}
			numPlayedToday++;
			//update play count!
			_this.dbc.query('UPDATE players SET lastPlayed=NOW(),numPlayedToday=? WHERE playerId=?',[numPlayedToday,slackUserId],function(error,results,fields){
				if(error != null){deferred.reject(error); return false;}
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
				if(error != null){deferred.reject(error); return false;}
				/*if(results.length == 0){
					//player doesn't have candy.
					
				}else{*/
				//player already has candy!
				for(var i=0;i<results.length;i++){
					candiesAlreadyHave[results[i].candyId] = true;
					//console.log("has "+results[i].candyId);
					_this.dbc.query('UPDATE playercandies SET amount=? WHERE playerCandyId=?',[results[i].amount+1,results[i].playerCandyId],function(error,results,fields){
						if(error != null){deferred.reject(error); return false;}
					});
				}

				//insert new candies for candies that do not exist in player inventory.
				for (var candyId in candiesAlreadyHave){
					if(!candiesAlreadyHave[candyId]){
						//console.log("doesn't have "+candyId);
						_this.dbc.query('INSERT INTO playercandies SET candyId=?,playerId=?,amount=1',[candyId,slackUserId],function(error,results,fields){
							if(error != null){deferred.reject(error); return false;}
						});
					}
				}
			});
		});
	});
	return deferred.promise;
}

module.exports = TRTDatabase;