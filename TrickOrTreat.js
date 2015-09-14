var Slack = require('slack-client');
//var fs = require('fs');
var math = require('mathjs');
var chalk = require('chalk');
var TrickDatabase = require('./database.js');
var Chance = require('chance');
var chance = new Chance();
var TreatStrings = require('./strings.js');
var treatStrings = new TreatStrings();

function TrickOrTreat(){
	this.config = require('./config');
	this.slackObj = new Slack(this.config.token, true, true);
	this.trickDatabase = new TrickDatabase(this);

	this.log('info','Connecting to MySQL ... ');
	this.trickDatabase.initDatabaseConnection(this.databaseConnected.bind(this));
	
}

TrickOrTreat.prototype.databaseConnected = function(){
	this.log('success','Connected To MySQL');

	this.log('info','Logging Into Slack ... ');
	this.slackObj.login();
	this.slackObj.on('open', this.slackConnectionOpened.bind(this));
};


TrickOrTreat.prototype.slackConnectionOpened = function(){
	this.log('success','Successfully Logged Into Slack - Ready to process messages');

	this.log('info',"I'm logged into the following channels:\n---------\n"+this.getCurrentChannelNames().join("\n")+"\n---------");
	this.slackObj.on('message', this.processMessage.bind(this));
	this.slackObj.on('error', this.slackObjError.bind(this));

	//this.sendMessageToSuperAdmins("Hello SuperAdmins!");	
	//this.sendMessageToAdmins("Hello Admins!");
	this.sendMsgToAllChannels(chance.pick(treatStrings.randomIntroMessages));
};

TrickOrTreat.prototype.processMessage = function(message){
	var msgChannel = this.slackObj.getChannelGroupOrDMByID(message.channel);
	var msgUserObj = this.slackObj.getUserByID(message.user);
	
	if(!msgUserObj){
		//Fake User?
		this.log('warning',"User was undefined");
		return false;
	}

	if(msgUserObj.id == this.slackObj.self.id){
		//We don't talk to ourself.
		return false;
	}

	//Check if we got this message from the mainstream channels (and not like a PM or something)
	var inMainChannels = false;
	var	mainChannelIds = Object.keys(this.getCurrentChannels());
	if(mainChannelIds.indexOf(message.channel) !== -1){
		inMainChannels = true;
	}

	//this.sendMessageToUser(msgUserObj.id,"Hi, you sent me a message!");

	if (message.type !== 'message' || (message.text === null) || (msgChannel === null)){
		this.log('warning',"got a message that wasn't type=message, or had a null channel or text.");
		this.sendMessageToSuperAdmins("Hey, I got a bad message. Please advise.");
		return false;
	}

	var msgArray = this.parseMessage(message.text);
	if(msgArray[0] !== '!trt'){return false;}

	switch(msgArray[1]){
		case undefined: //play the game
			if(inMainChannels){
				this.sendMessageToChannel(msgChannel,msgUserObj.name+" went trick or treating");
			}else{
				this.sendMessageToUser(msgUserObj.id,"I will not take you trick or treating in private.\nPlease use one of the following channels: #"+this.getCurrentChannelNames().join(" or #"));	
			}
			break;
		case 'register':
			this.trickDatabase.register(msgUserObj,this.registerResponse.bind(this,msgChannel));
			break;
		case 'help':
			//if(msgArray[2])
			var helpStr = "";
			for(var topic in treatStrings.help){
				helpStr+="["+topic+"] "+treatStrings.help[topic].short+"\n";
			}
			this.sendMessageToUser(msgUserObj.id,chance.pick(treatStrings.helpHeader)+" (Be sure to click 'Show more...')",[{"color": "#36a64f",text:"\n"+helpStr}]);
			break;
		case 'debug':
			if(this.config.admins.indexOf(msgUserObj.name) == -1){ 
				this.sendMessageToUser(msgUserObj.id,chance.pick(treatStrings.notAuthorizedMessages)+"\n(You sent me: '"+msgArray.join(" ")+"')");
				return false;
			}
			var paramStr = "";
			for(var i = 2;i<msgArray.length;i++){
				paramStr += msgArray[i]+"\n";
			}
			if(paramStr !== ""){
				this.sendMessageToChannel(msgChannel,"These are the parameters I saw:\n"+paramStr);
			}
			break;
		/*
		case 'resetday':
			if(slackUser.name !== 'sirtopeia' && slackUser.name !== 'void'){return false;}
			TOTController.resetCooldowns();
			channel.send(slackUser.name+" reset the game day!");
			break;
		case 'give':
			var response = TOTController.giveCandy(msgArray[2],msgArray[3],msgArray[4]);
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
		*/
		default:
			this.sendMessageToChannel(msgChannel,"Unknown command (try using !trt help)");
			break;

	}

};

TrickOrTreat.prototype.registerResponse = function(channel,msg){
	channel.send(msg);
};

TrickOrTreat.prototype.parseMessage = function(message){
	var params = message.match(/'[^']*'|"[^"]*"|\S+/g) || [];
	for(var i=0;i<params.length;i++){
		params[i] = params[i].replace(/"/g, "");
	}
	return params;
};

TrickOrTreat.prototype.sendMessageToAdmins = function(msg){
	for(var i=0;i<this.config.admins.length;i++){
		var admin = this.slackObj.getUserByName(this.config.admins[i]);
		if(admin){
			this.sendMessageToUser(admin.id,msg);
		}else{
			this.log("warning","The admin '"+this.config.admins[i]+"' is not a user in this slack group!");
		}
	}
};

TrickOrTreat.prototype.sendMessageToSuperAdmins = function(msg){
	for(var i=0;i<this.config.superadmins.length;i++){
		var superadmin = this.slackObj.getUserByName(this.config.superadmins[i]);
		if(superadmin){
			this.sendMessageToUser(superadmin.id,msg);
		}else{
			this.log("warning","The superadmin '"+this.config.superadmins[i]+"' is not a user in this slack group!");
		}
	}
};

TrickOrTreat.prototype.sendMessageToChannel = function(channel,message,attachments){
	channel.postMessage({as_user:true,text:this.addHumor(message),attachments:attachments});
};

TrickOrTreat.prototype.sendMessageToUser = function(userId,message,attachments){
	this.slackObj.openDM(userId,this.sendMessageToUserConnected.bind(this,this.addHumor(message),attachments));
};

TrickOrTreat.prototype.sendMessageToUserConnected = function(message,attachments,dm){
	this.slackObj.getChannelGroupOrDMByID(dm.channel.id).postMessage({as_user:true,text:this.addHumor(message),attachments:attachments});

};

TrickOrTreat.prototype.sendMsgToAllChannels = function(msg){
	var channelIds =  Object.keys(this.getCurrentChannels());
	for(var i=0;i<channelIds.length;i++){
		this.slackObj.getChannelGroupOrDMByID(channelIds[i]).send(this.addHumor(msg));	
	}
};

TrickOrTreat.prototype.getCurrentChannelNames = function(){
	var currentChannels = this.getCurrentChannels();
	var channelIds =  Object.keys(currentChannels);
	var channelNames = [];
	for(var i=0;i<channelIds.length;i++){
		channelNames.push(currentChannels[channelIds[i]].name);
	}
	return channelNames;
};

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
};

TrickOrTreat.prototype.slackObjError = function(error){
	this.log('error',error.msg);
	process.exit(1);
};

TrickOrTreat.prototype.error = function(error){
	this.log('error',error);
	if(this.slackObj.connected){
		this.sendMsgToAllChannels("An error has occured and I need to restart, please stand by!\n\n(PING @"+this.config.admins.join(" & @")+")");
		//No async here!
		//this.sendMessageToSuperAdmins("Hey, I crashed on this error: "+error,true);	
	}else{
		this.log('error',"I cannot send out error messages without a slack connection!");
	}
	process.exit(1);
};

TrickOrTreat.prototype.addHumor = function(msg){
	var edited = msg;
	if(chance.bool({likelihood: 10})){
		edited = edited+" "+chance.pick(treatStrings.bleepsAndBloopsEnd);	
	}

	if(chance.bool({likelihood: 10})){
		edited = chance.pick(treatStrings.bleepsAndBloopsStart)+" "+edited;	
	}
	
	return edited;	
};

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
};

module.exports = TrickOrTreat;

