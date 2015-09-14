var Slack = require('slack-client');
var fs = require('fs')
var math = require('mathjs');
var chalk = require('chalk');
var TrickDatabase = require('./database.js');

function TrickOrTreat(){

	this.config = require('./config');
	this.slackObj = new Slack(this.config.token, true, true);
	this.trickDatabase = new TrickDatabase(this);

	this.nonCandies = new Array(
		"Apple"
		,"Banana"
		,"Toothbrush"
		,"Raisins"
		,"Loose change"
		,"Dental Floss"
		,"Toothpicks"
	);

	this.help = {
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
		,'!trt give':{
			short:"Usage: !trt give {number} {candy} {player}"
			,long:"Usage: !trt give {number} {candy} {player} \n Use this to donate some of your candy to another player - not to be confused with !trt trade"
		}
		,'!trt help':{
			short:"Shows this block of text"
			,long:"Shows this block of text"
		}
	}	

	this.log('info','Connecting to MySQL ... ');
	this.trickDatabase.initDatabaseConnection(this.databaseConnected.bind(this));
	
}

TrickOrTreat.prototype.databaseConnected = function(){
	this.log('info','Connected To MySQL');

	this.log('info','Logging Into Slack ... ');
	this.slackObj.login();
	this.slackObj.on('open', this.slackConnectionOpened.bind(this));
}


TrickOrTreat.prototype.slackConnectionOpened = function(){
	this.log('info','Successfully Logged Into Slack');
}


TrickOrTreat.prototype.getCurrentChannels = function(){
	var channelIds = Object.keys(this.slackObj.channels);
	for(var i = 0;i<channelIds.length;i++){
		console.log("Channel: "+i);	
		console.log(this.slackObj.channels[channelIds[i]].name);
	}
}

TrickOrTreat.prototype.log = function(type,msg){
	switch(type){
		case 'info':
			console.log(chalk.cyan(msg));
			break;
		case 'warning':
			console.log(chalk.yellow(msg));
			break;
		case 'error':
			console.log(chalk.red(msg));
			process.exit(1);
			break;
	}
}

module.exports = TrickOrTreat;

