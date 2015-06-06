var Slack = require('slack-client');
var fs = require('fs')
var config = require('./config');
var slack = new Slack(config.token, true, true);
var TOTController = require('./controller');
slack.login();

/*
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
*/

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
		//channel.send(msgArray[0]);
		switch(msgArray[0]){
			case '!debug':
				if(user.name !== 'sirtopeia'){ return false; }
				var paramStr = "";
				for(var i = 1;i<msgArray.length;i++){
					paramStr += msgArray[i]+"\n";
				}
				if(paramStr !== ""){
					channel.send("These are the parameters I saw:\n"+paramStr);
				}
				break;
			case '!loadcandy':
				if(user.name !== 'sirtopeia'){ channel.send("Only @sirtopeia can add candy!"); return false; }
				channel.send("Loading candy into database....done!");
				break;
			case '!give':
				if(msgArray.length != 4){
					channel.send("Wrong number of parameters! (!give {number} {candy} {player})");
					return false;
				}
				if(!isNaN(parseFloat(msgArray[1])) && isFinite(msgArray[1])){
					channel.send("Giving "+msgArray[1]+" "+msgArray[2]+" to @"+msgArray[3]);
				}else{
					channel.send("Candy Count must be numeric");
					return false;
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