var Slack = require('slack-client');
var fs = require('fs')
var config = require('./config');
var slack = new Slack(config.token, true, true);
var TOTController = require('./controller');
slack.login();
var timerInterval;
var math = require('mathjs');

var nonCandies = new Array(
	"Apple"
	,"Banana"
	,"Toothbrush"
	,"Raisins"
	,"Loose change"
	,"Dental Floss"
	,"Toothpicks"
);

var help = {
	'!trt':{
		short:"You go trick or treating"
		,long:"You go trick or treating (Assuming you're registered) - this allows you to earn up to three pieces of candy, twice a day."
	}
	,'!trt register':{
		short:"Registers your account in order to start playing the game"
		,long:"Registers your account in order to start playing the game"
	}
	,'!trt count':{
		short:"Shows your current candy counts"
		,long:"Shows your current candy counts"
	}
	/*,'!trt give':{
		short:"Usage: !trt give {number} {candy} {player}"
		,long:"Usage: !trt give {number} {candy} {player} \n Use this to donate some of your candy to another player - not to be confused with !trt trade"
	}*/
	,'!trt help':{
		short:"Shows this block of text"
		,long:"Shows this block of text"
	}
}	

//The following objects will be for storing players times. This will be checked first instead of the database to reduce stress it.
playerLastCommandCache = {};
playerLastTRTCache = {};
//If we show the player x amount of warnings, maybe we ban them! (perhaps 10?)
playerWarnings = {};
warningsTillIgnore = 5;

slack.on('open', function () {
	var channels = Object.keys(slack.channels)
		.map(function (k) { return slack.channels[k]; })
		.filter(function (c) { return c.is_member; })
		.map(function (c) { return c.name; });

	var groups = Object.keys(slack.groups)
		.map(function (k) { return slack.groups[k]; })
		.filter(function (g) { return g.is_open && !g.is_archived; })
		.map(function (g) { return g.name; });

	console.log('Welcome to Slack. You are ' + slack.self.name + ' of ' + slack.team.name);

	if (channels.length > 0) {
		console.log('You are in: ' + channels.join(', '));
	}
	else {
		console.log('You are not in any channels.');
	}
	if (groups.length > 0) {
	   console.log('As well as: ' + groups.join(', '));
	}

	var channelIds = Object.keys(slack.channels)
		.map(function (k) { return slack.channels[k]; })
		.filter(function (c) { return c.is_member; })
		.map(function (c) { return c.id; });

	for(var i=0;i<channelIds.length;i++){
		slack.getChannelGroupOrDMByID(channelIds[i]).send(slack.self.name+" is now online");
	}
	clearInterval(timerInterval);
	timerInterval = setInterval(function(){
		var d = new Date();
		var hour = d.getHours()
		var minute = d.getMinutes()
		if(hour == 0 && minute == 0){ //midnight local time!
			TOTController.setChannel(slack.getChannelGroupOrDMByID(channelIds[0]));
			TOTController.resetCooldowns();
			playerWarnings = {}; //reset warnings
			for(var i=0;i<channelIds.length;i++){
				slack.getChannelGroupOrDMByID(channelIds[i]).send("Trick or Treat day reset! Come collect your daily candies!");
			}
		}
	},60000) //60 seconds

});

slack.on('message', function(message) {
	var channel = slack.getChannelGroupOrDMByID(message.channel);
	var slackUserId = message.user;
	var slackUser = slack.getUserByID(slackUserId);
	TOTController.setChannel(channel);

	//console.log(message.type);

	if (message.type === 'message' && (message.text != null) && (channel != null)){
		var msgArray = TOTController.parseMessage(message.text);
		if(msgArray[0] !== '!trt'){return false;}

		if(playerWarnings[slackUserId] != null && playerWarnings[slackUserId] >= warningsTillIgnore){return false;}

		//check if they are sending too many commands
		if(playerLastCommandCache[slackUserId] == null){
			playerLastCommandCache[slackUserId] = new Date();
		}else{
			//less than 3 seconds between commands? send a warning.
			if(new Date() - playerLastCommandCache[slackUserId] < 3000){ //less than 3 seconds.
				if(playerWarnings[slackUserId] == null){
					playerWarnings[slackUserId] = 1;
				}else{
					playerWarnings[slackUserId] += 1;
				}
				if(playerWarnings[slackUserId] == warningsTillIgnore){
					channel.send(slackUser.name+", I warned you!\nI'm ignoring you now.");
					return false;
				}
				channel.send(slackUser.name+", Please slow down with the commands!!\n*+1 warning!* (currently "+playerWarnings[slackUserId]+")\nIf you get "+warningsTillIgnore+", I'll ignore you till tomorrow.");
				//return false;
			}
		}

		//update when they last sent a command.
		playerLastCommandCache[slackUserId] = new Date();

		switch(msgArray[1]){
			case undefined: //play the game
				TOTController.trickortreat(slackUserId,slackUser.name);
				break;
			case 'register':
				TOTController.register(slackUserId,slackUser.name);
				break;
			case 'help':
				//if(msgArray[2])
				var helpStr = "";
				for(var topic in help){
					helpStr+="*"+topic+"*: "+help[topic].short+"\n";
				}
				channel.send(helpStr);
				break;
			case 'debug':
				if(slackUser.name !== 'sirtopeia'){ return false; }
				var paramStr = "";
				for(var i = 2;i<msgArray.length;i++){
					paramStr += msgArray[i]+"\n";
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
				var response = TOTController.giveCandy(msgArray[2],msgArray[3],msgArray[4])
				if(response.success){

				}else{
					channel.send(response.error);					
				}
				break;
			case 'solve':
				//if(slackUser.name !== 'sirtopeia'){return false;}
				try{
					channel.send(""+math.eval(msgArray[2]));
				}catch(e){
					channel.send("Failed to solve!");
				}
				break;
			case 'count':
				TOTController.candyCount(slackUserId,slackUser.name);
				break;
			default:
				channel.send("Unknown command (try using !trt help)");
				break;

		}
		/*
		if(message.text.indexOf("!trickortreat") == 0 || message.text.indexOf("!trt") == 0 || message.text.indexOf("!tot") == 0){
			trickortreat(channel,user);
		}

		if(message.text.indexOf("!candytotal") == 0 || message.text.indexOf("!ct") == 0){
			if(players[slackUserId] != null){
				channel.send(slackUser.name+", you have "+players[slackUserId]+" candies!");
			}else{
				channel.send("You havn't started playing yet!");
			}
		}
		*/
	}
});