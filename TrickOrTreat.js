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
	this.log('success','Connected To MySQL');

	this.log('info','Logging Into Slack ... ');
	this.slackObj.login();
	this.slackObj.on('open', this.slackConnectionOpened.bind(this));
}


TrickOrTreat.prototype.slackConnectionOpened = function(){
	this.slackConnected = true;
	this.log('success','Successfully Logged Into Slack - Ready to process messages');

	this.log('info',"I'm logged into the following channels:\n---------\n"+this.getChannelsStringList()+"\n---------");
	this.slackObj.on('message', this.processMessage.bind(this));
	this.slackObj.on('error', this.slackObjError.bind(this));

	var randomIntroMessages = [
		this.slackObj.self.name+" is now online"
		,"Your friendly neighborhood bot is ready to give out candy"
		,"Hi everyone, who wants some candy?"
		,"Beep Boop Powering Up!"
	]

	this.sendMessageToSuperAdmins("Hello SuperAdmins!");	
	this.sendMessageToAdmins("Hello Admins!");	
	this.sendMsgToAllChannels(randomIntroMessages[Math.floor(Math.random()*randomIntroMessages.length)]);
}

TrickOrTreat.prototype.processMessage = function(message){
	var msgChannel = this.slackObj.getChannelGroupOrDMByID(message.channel);
	var msgUserObj = this.slackObj.getUserByID(message.user);
	if(msgUserObj.id == this.slackObj.self.id){
		//We don't talk to ourself.
		return false;
	}

	this.sendMessageToUser(msgUserObj.id,"Hi, you sent me a message!");

	//this.slackObj.getChannelGroupOrDMByID(msgUserObj.id).send("Hello "+msgUserObj.name);

	if (message.type !== 'message' || (message.text === null) || (msgChannel === null)){
		this.log('warning',"got a message that wasn't type=message, or had a null channel or text.");
		this.sendMessageToSuperAdmins("Hey, I got a bad message. Please advise.");
		return false;
	}

}

TrickOrTreat.prototype.sendMessageToAdmins = function(msg){
	for(var i=0;i<this.config.admins.length;i++){
		var admin = this.slackObj.getUserByName(this.config.admins[i])
		if(admin){
			this.sendMessageToUser(admin.id,msg);
		}else{
			this.log("warning","The admin '"+this.config.admins[i]+"' is not a user in this slack group!");
		}
	}
}

TrickOrTreat.prototype.sendMessageToSuperAdmins = function(msg){
	for(var i=0;i<this.config.superadmins.length;i++){
		var superadmin = this.slackObj.getUserByName(this.config.superadmins[i])
		if(superadmin){
			this.sendMessageToUser(superadmin.id,msg);
		}else{
			this.log("warning","The superadmin '"+this.config.superadmins[i]+"' is not a user in this slack group!");
		}
	}
}

TrickOrTreat.prototype.sendMessageToUser = function(userId,message){
	this.slackObj.openDM(userId,this.sendMessageToUserConnected.bind(this,message));
}

TrickOrTreat.prototype.sendMessageToUserConnected = function(message,dm){
	this.slackObj.getChannelGroupOrDMByID(dm.channel.id).send(message);
}

TrickOrTreat.prototype.sendMsgToAllChannels = function(msg){
	var channelIds =  Object.keys(this.getCurrentChannels());
	for(var i=0;i<channelIds.length;i++){
		this.slackObj.getChannelGroupOrDMByID(channelIds[i]).send(msg);	
	}
}

TrickOrTreat.prototype.getChannelsStringList = function(){
	var currentChannels = this.getCurrentChannels();
	var channelIds =  Object.keys(currentChannels);
	var channelNames = [];
	for(var i=0;i<channelIds.length;i++){
		channelNames.push(currentChannels[channelIds[i]].name);
	}
	return channelNames.join("\n");
}

TrickOrTreat.prototype.getCurrentChannels = function(){
	var channelIds = Object.keys(this.slackObj.channels);
	var channels = [];
	for(var i = 0;i<channelIds.length;i++){
		//Only return channels we're apart of
		if(this.slackObj.channels[channelIds[i]].is_member){
			channels[channelIds[i]] = this.slackObj.channels[channelIds[i]];
		}
	}
	return channels;
}

TrickOrTreat.prototype.slackObjError = function(error){
	this.log('error',error.msg);
	process.exit(1);
}

TrickOrTreat.prototype.error = function(error){
	this.log('error',error);
	if(this.slackConnected){
		this.sendMsgToAllChannels("*Beep Boop* An error has occured and I need to restart, please stand by!\n\n(I just PM'd error reports to "+this.config.superadmins.join(" & ")+")");
		this.sendMessageToSuperAdmins("Hey, I crashed on this error: "+error);	
	}else{
		this.log('error',"I cannot send out error messages without a slack connection!");
	}
	process.exit(1);
}

TrickOrTreat.prototype.log = function(type,msg){
	switch(type){
		case 'info':
			console.log(chalk.cyan(msg));
			break;
		case 'warning':
			console.log(chalk.yellow(msg));
			break;
		case 'success':
			console.log(chalk.green(msg));
			break;
		case 'error':
			console.log(chalk.red(msg));
			break;
	}
}

module.exports = TrickOrTreat;

