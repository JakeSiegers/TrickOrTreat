var Slack = require('slack-client');
var fs = require('fs')
var token = fs.readFileSync('tokenfile').toString();
var slack = new Slack(token, true, true);
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

	console.log(message.type);

	if (message.type === 'message' && (message.text != null) && (channel != null)){

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
	}
});


function trickortreat(channel,user){
	if(players[user.id] == null){
		channel.send("Hello "+user.name+", Lets's play! You start with 0 candies!")
		players[user.id] = 0;
	}

	var selection = Math.floor(Math.random()*1000)+1;
	if(selection>950){
		channel.send(user.name+", you found a "+nonCandies[Math.floor(Math.random()*nonCandies.length)]+"... You still have "+players[user.id]+" candies.")
		return;
	}

	candiesFound = 1;
	var candiesFoundChance = Math.floor(Math.random()*100)+1;
	if(candiesFoundChance<15){
		candiesFound = 2;
	}else if(candiesFoundChance<3){
		candiesFound = 3;
	}
	players[user.id] += candiesFound;
	channel.send(user.name+", you found "+candiesFound+" "+candies[Math.floor(Math.random()*candies.length)]+"! You now have "+players[user.id]+" candies!")
}