var Slack = require('slack-client');
var fs = require('fs')
var config = require('./config');
var slack = new Slack(config.token, true, true);
var TOTController = require('./controller');
slack.login();


var players = {};

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
	'give':'!trt give {number} {candy} {player}'
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
		//slack.getChannelGroupOrDMByID(channelIds[i]).send("Trick or Treet has been started!");
	}

});

slack.on('message', function(message) {
	var channel = slack.getChannelGroupOrDMByID(message.channel);
	var user = slack.getUserByID(message.user);
	//ßconsole.log(user);

	//console.log(message.type);

	if (message.type === 'message' && (message.text != null) && (channel != null)){

		var msgArray = TOTController.parseMessage(message.text);
		if(msgArray[0] !== '!trt'){return false;}

		if(playerWarnings[message.user] != null && playerWarnings[message.user] >= warningsTillIgnore){return false;}

		//check if they are sending too many commands
		if(playerLastCommandCache[message.user] != null){
			playerLastCommandCache[message.user] = new Date();
		}else{
			//less than 3 seconds between commands? send a warning.
			if(new Date().getTime() / 1000 - playerLastCommandCache[message.user] < 3){
				if(playerWarnings[message.user] == null){
					playerWarnings[message.user] = 1;
				}else{
					playerWarnings[message.user] += 1;
				}
				channel.send("Yo, "user.name+", Please slow down with the commands!\n*+1 warning!* (currently "+playerWarnings[message.user]+")\nIf you get "+warningsTillIgnore+", I'll ignore you.");
				return false;
			}
		}
		//update when they last sent a command.
		playerLastCommandCache[message.user] = new Date();
		
		//channel.send(msgArray[0]);
		switch(msgArray[1]){
			case null:
				var response = TOTController.trickortreat(message.user);
				if(response.success){
					//channel.send();
				}else{
					channel.send(response.error);
				}
				break;
			case 'help':
				//if(msgArray[2])
				break;
			case 'debug':
				if(user.name !== 'sirtopeia'){ return false; }
				var paramStr = "";
				for(var i = 1;i<msgArray.length;i++){
					paramStr += msgArray[i]+"\n";
				}
				if(paramStr !== ""){
					channel.send("These are the parameters I saw:\n"+paramStr);
				}
				break;
			case 'loadcandy':
				if(user.name !== 'sirtopeia'){ channel.send("Only @sirtopeia can add candy!"); return false; }
				channel.send("Loading candy into database....done!");
				break;
			case 'give':
				var response = TOTController.give(msgArray[2],msgArray[3],msgArray[4])
				if(response.success){

				}else{
					channel.send(response.error);					
				}
				break;

		}
		/*
		if(message.text.indexOf("!trickortreat") == 0 || message.text.indexOf("!trt") == 0 || message.text.indexOf("!tot") == 0){
			trickortreat(channel,user);
		}

		if(message.text.indexOf("!candytotal") == 0 || message.text.indexOf("!ct") == 0){
			if(players[message.user] != null){
				channel.send(user.name+", you have "+players[message.user]+" candies!");
			}else{
				channel.send("You havn't started playing yet!");
			}
		}
		*/
	}
});