//Making this global, cause scope.
var _this = null;

function TrickOrTreat(){
	_this = this;

	//Load Config
	this.config = require('./config');

	//Promises
	this.Q  = require('q');
	this.Q.longStackSupport = true;
	
	//Start Up Slack API
	var SlackBot = require('slackbots');
	this.trtBot = new SlackBot({
		token:this.config.token
		,name:this.config.botName
	});

	//Math Library, cause why not?
	this.math = require('mathjs');

	this.timerInterval;

	//Load up database class
	var db = require('./database');
	this.TRTDatabase = new db(this.trtBot);

	//The following objects will be for storing players times. This will be checked first instead of the database to reduce stress it.
	this.playerLastCommandCache = {};
	this.playerLastTRTCache = {};
	//If we show the player x amount of warnings, maybe we ban them! (perhaps 10?)
	this.playerWarnings = {};
	this.warningsTillIgnore = 5;

	this.randomWelcomeMessages = [
		"Your friendly trick or treat bot is now online"
	];
	
	this.trtBot.on('start', function() {
		//Send random welcome message
		_this.sendMsgToAllChannels(_this.randomWelcomeMessages[Math.floor(Math.random()*_this.randomWelcomeMessages.length)]);
	});

	this.trtBot.on('message',function(data){
		_this.processEvent(data);
	});
}

TrickOrTreat.prototype.processEvent = function(data){
	//console.log(data.type);
	switch(data.type){
		case 'message':
			console.log("message");
			_this.getUserById(data.user).then(function(userProfile){
				console.log("processing message");
				_this.processMessage(data,userProfile);
			});
			break;
		case 'presence_change':
			if(data.presence == "active"){
				//Maybe welcome people?
			}
			break;
		case 'user_typing':
			/*
			_this.getUserById(data.user).then(function(userFound){
				_this.sendMsg(data.channel,userFound.name+" I don't care what you have to say.")
			});
			*/
			break;
	}
}

TrickOrTreat.prototype.errorCatch = function(error){
	console.log(error);
	_this.sendMsgToAllChannels("I have encountered an error and have to close, goodbye!");
	setTimeout(function(){process.exit(1);},1000);
}

TrickOrTreat.prototype.processDatabaseResponse = function(response,msgData){
	if(response.success){
		_this.sendMsg(msgData.channel,response.message);
	}else{
		_this.sendMsg(msgData.channel,response.error);
	}
}

TrickOrTreat.prototype.processMessage = function(msgData,userProfile){
	var params = _this.parseParameters(msgData.text);
	if(params[0] !== "!trt"){return false;}

	switch(params[1]){
		case undefined: //play the game
			_this.TRTDatabase.TrickOrTreat(msgData.user,userProfile.name)
				.then(function(response){_this.processDatabaseResponse(response,msgData)})
				.catch(_this.errorCatch);
			break;
		case 'register':
			_this.TRTDatabase.register(msgData.user,userProfile.name)
				.then(function(response){_this.processDatabaseResponse(response,msgData)})
				.catch(_this.errorCatch);
			break;
		/*
		case 'help':
			//if(params[2])
			var helpStr = "";
			for(var topic in help){
				helpStr+="*"+topic+"*: "+help[topic].short+"\n";
			}
			channel.send(helpStr);
			break;
		case 'debug':
			if(slackUser.name !== 'sirtopeia'){ return false; }
			var paramStr = "";
			for(var i = 2;i<params.length;i++){
				paramStr += params[i]+"\n";
			}
			if(paramStr !== ""){
				channel.send("These are the parameters I saw:\n"+paramStr);
			}
			break;
		case 'resetday':
			if(slackUser.name !== 'sirtopeia' && slackUser.name !== 'void'){return false;}
			TOTController.resetCooldowns();
			channel.send(slackUser.name+" reset the game day!");
			break;
		case 'loadcandy':
			if(slackUser.name !== 'sirtopeia'){channel.send("Only sirtopeia can add candy!"); return false; }
			TOTController.addCandy();
			break;
		case 'give':
			var response = TOTController.giveCandy(params[2],params[3],params[4])
			if(response.success){

			}else{
				channel.send(response.error);					
			}
			break;
		case 'solve':
			//if(slackUser.name !== 'sirtopeia'){return false;}
			try{
				channel.send(""+math.eval(params[2]));
			}catch(e){
				channel.send("Failed to solve!");
			}
			break;
		case 'count':
			TOTController.candyCount(slackUserId,slackUser.name);
			break;
		*/
		default:
			channel.send("Unknown command (try using !trt help)");
			break;
	}
}

TrickOrTreat.prototype.getUserById = function(searchId){
	var deferred = _this.Q.defer();
	_this.trtBot.getUsers().then(function(userData){
		for(var i in userData.members){
			if(userData.members[i].id == searchId){
				deferred.resolve(userData.members[i]);
			}
		}
		throw new Error("User Not Found!");
	});
	return deferred.promise;
}

TrickOrTreat.prototype.parseParameters = function(message){
	//very basic, doesnt count for escaped characters - just basic quoting.
	var params = message.match(/'[^']*'|"[^"]*"|\S+/g) || [];
	for(var i=0;i<params.length;i++){
		params[i] = params[i].replace(/"/g, "");
	}
	return params;
}

TrickOrTreat.prototype.sendMsgToAllChannels = function(msg){
	_this.trtBot.getChannels().then(function(foundChannels){
		for(i in foundChannels.channels){
			_this.trtBot.postMessageToChannel(foundChannels.channels[i].name,msg,{
				icon_emoji:':jack_o_lantern:'
			});
		}
	});
}

TrickOrTreat.prototype.sendMsg = function(locationId,msg){
	_this.trtBot.postMessage(locationId,msg,{
		icon_emoji:':jack_o_lantern:'
	});
}

module.exports = new TrickOrTreat();