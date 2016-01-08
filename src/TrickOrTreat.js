var Slack = require('slack-client');
//var fs = require('fs');
var math = require('mathjs');
var chalk = require('chalk');
var TreatController = require('./TreatController.js');
var TreatDatabase = require('./TreatDatabase.js');
var ChanceJS = require('chance');
var chance = new ChanceJS();
var TreatStrings = require('./strings.js');

function TrickOrTreat(){
	this.config = require('./config');
	this.slackObj = new Slack(this.config.token, true, true);
	this.database = new TreatDatabase(this);
	this.controller = new TreatController(this);
	this.treatStrings = new TreatStrings();
	this.numSlackConnections = 0;

	this.botface = {
		defaultName: this.config.botName,
		currentName: this.config.botName,
		defaultImage: this.config.botImage,
		currentImage: this.config.botImage
	};

	this.log('info','Connecting to MySQL ... ');
	this.database.initDatabaseConnection(this.databaseConnected.bind(this));
}

TrickOrTreat.prototype.databaseConnected = function(){
	this.log('success','Connected To MySQL');

	this.log('info','Logging Into Slack ... ');
	this.slackObj.login();
	this.slackObj.on('open', this.slackConnectionOpened.bind(this));
};


TrickOrTreat.prototype.slackConnectionOpened = function(){
	this.numSlackConnections++;
	if(this.numSlackConnections > 1){
		if(this.slackObj.connected){
			this.sendMessageToSuperAdmins("I detected the \"TRT double bug\" and just stopped it. (Connection to slack lost, then recovered)");	
		}
		return false;
	}
	console.log(this.numSlackConnections);

	this.log('success','Successfully Logged Into Slack - Ready to process messages');

	this.log('info',"I'm logged into the following channels:\n---------\n"+this.getCurrentChannelNames().join("\n")+"\n---------");
	this.slackObj.on('message', this.processMessage.bind(this));
	this.slackObj.on('error', this.error.bind(this));

	//this.sendMessageToSuperAdmins("Hello SuperAdmins!");	
	//this.sendMessageToAdmins("Hello Admins!");
	this.sendMsgToAllChannels(chance.pick(this.treatStrings.randomIntroMessages));

	timerInterval = setInterval(this.checkIfWeNeedToResetDay.bind(this),60000);
};

TrickOrTreat.prototype.timeTillDayReset = function(){
	var date = new Date();
	var hour = date.getHours();
	var minutes = date.getMinutes();
	var hoursLeft = 23-hour;
	var minutesLeft = 60-minutes;
	return {
		hours:hoursLeft,
		hoursStr: (hoursLeft>0?hoursLeft+" hour"+(hoursLeft!=1?"s":""):""),
		minutes : minutesLeft,
		minutesStr : minutesLeft+" minute"+(minutesLeft!=1?"s":"")
	};
};

TrickOrTreat.prototype.checkIfWeNeedToResetDay = function(){
	var d = new Date();
	var hour = d.getHours();
	var minute = d.getMinutes();
	if(hour === 0 && minute === 0){ //midnight local time!
		this.database.resetCooldowns(this.resetCooldownsResponse.bind(this,"Hey all, It's midnight, so I just"));
	}
	if(hour == 6 && minute === 0){
		var timeTillReset = this.timeTillDayReset();
		this.sendMsgToAllChannels("@here "+chance.pick(this.treatStrings.playReminders)+"\n(Day resets in "+timeTillReset.hoursStr+" "+timeTillReset.minutesStr+")");
	}
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

	//Maybe send a random message to response to people. We're alive, right?
	if(chance.bool({likelihood: 5})){



		
	}

	var msgArray = this.parseMessage(message.text);
	if(msgArray[0].toLowerCase() !== '!trt' && msgArray[0].toLowerCase() !== '!trickortreat'){return false;}

	switch(msgArray[1]){
		case undefined: //play the game
			if(inMainChannels){
				this.controller.goTrickOrTreating(msgUserObj,this.genericResponse.bind(this,msgChannel));
				//this.sendMessageToChannel(msgChannel,msgUserObj.name+" went trick or treating");
			}else{
				this.sendMessageToUser(msgUserObj.id,"I will not take you trick or treating in private.\nPlease use one of the following channels: #"+this.getCurrentChannelNames().join(" or #"));	
			}
			break;
		case 'register':
			this.controller.register(msgUserObj,this.genericResponse.bind(this,msgChannel));
			break;
		case 'help':
			//if(msgArray[2])
			var help = [];
			for(var topic in this.treatStrings.help){
				help.push({
					"title":topic,
					"value":this.treatStrings.help[topic].short,
					"short":false
				});
			}
			this.sendMessageToUser(msgUserObj.id,chance.pick(this.treatStrings.helpHeader),[{"color": "#36a64f",fields:help}]);
			break;
		case 'debug':
			if(this.config.admins.indexOf(msgUserObj.name) == -1){ 
				this.sendMessageToUser(msgUserObj.id,chance.pick(this.treatStrings.notAuthorizedMessages)+"\n(You sent me: '"+msgArray.join(" ")+"')");
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
		
		case 'resetday':
			if(this.config.admins.indexOf(msgUserObj.name) == -1){ 
				this.sendMessageToUser(msgUserObj.id,chance.pick(this.treatStrings.notAuthorizedMessages)+"\n(You sent me: '"+msgArray.join(" ")+"')");
				return false;
			}
			this.database.resetCooldowns(this.resetCooldownsResponse.bind(this,msgUserObj.name));
			break;
		case 'setimage':
			if(this.config.admins.indexOf(msgUserObj.name) == -1){ 
				this.sendMessageToUser(msgUserObj.id,chance.pick(this.treatStrings.notAuthorizedMessages)+"\n(You sent me: '"+msgArray.join(" ")+"')");
				return false;
			}
			this.botface.currentImage = msgArray[2];
			this.sendMessageToChannel(msgChannel,chance.pick(this.treatStrings.okay));
			break;
		/*
		case 'give':
			var response = TOTController.giveCandy(msgArray[2],msgArray[3],msgArray[4]);
			if(response.success){

			}else{
				channel.send(response.error);					
			}
			break
		*/
		case 'solve':
			try{
				this.sendMessageToChannel(msgChannel,chance.pick(this.treatStrings.randomSolveMessages),[{color:"#FF0000",text:math.eval(msgArray[2])}]);
			}catch(e){
				this.sendMessageToChannel(msgChannel,"Failed to solve!");
			}
			break;
		case 'count':
			this.controller.generateCandyCountAttachment(msgUserObj,this.genericResponseWithAttachment.bind(this,msgChannel));
			break;
		case 'leaders':
			this.controller.generateLeaderboard(this.genericResponseWithAttachment.bind(this,msgChannel));
			break;
		case 'rank':
			this.controller.showPlayerRank(msgUserObj,this.genericResponse.bind(this,msgChannel));
			break;
		case 'broadcast':
			if(this.config.admins.indexOf(msgUserObj.name) == -1){ 
				this.sendMessageToUser(msgUserObj.id,chance.pick(this.treatStrings.notAuthorizedMessages)+"\n(You sent me: '"+msgArray.join(" ")+"')");
				return false;
			}
			this.sendMsgToAllChannels(msgArray[2]);
			break;
		default:
			this.sendMessageToChannel(msgChannel,"Unknown command (try using !trt help)");
			break;

	}

};

//Anytime the controller just responds with a message!
TrickOrTreat.prototype.genericResponse = function(channel,msg){
	this.sendMessageToChannel(channel,msg);
};

//Anytime the controller just responds with a an attachment!
TrickOrTreat.prototype.genericResponseWithAttachment = function(channel,msg,attachment){
	this.sendMessageToChannel(channel,msg,attachment);
};


TrickOrTreat.prototype.resetCooldownsResponse = function(name,error,results,fields){
	//TODO: No database code in this class, get that out of here
	if(error !== null){ this.error(error); return;}
	this.sendMsgToAllChannels(name+" reset the game day!");
};


TrickOrTreat.prototype.parseMessage = function(message){
	var params = message.match(/'[^']*'|"[^"]*"|\S+/g) || [];
	for(var i=0;i<params.length;i++){
		params[i] = params[i].replace(/"/g, "");
	}
	return params;
};


// ==== SENDING MESSAGES =====

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

//This function is not async
//you lose the ability to post attachments and for custom names and images
//But you can call this function on exit or something and not have to wait for it to actually send the message
TrickOrTreat.prototype.sendMessageToChannelSYNC = function(channel,message){
	channel.send(this.addHumor(message));
};

TrickOrTreat.prototype.sendMessageToChannel = function(channel,message,attachments){
	channel.postMessage({username:this.botface.currentName,icon_url:this.botface.currentImage,as_user:true,text:this.addHumor(message),attachments:attachments});
};

TrickOrTreat.prototype.sendMessageToUser = function(userId,message,attachments){
	this.slackObj.openDM(userId,this.sendMessageToUserConnected.bind(this,this.addHumor(message),attachments));
};

TrickOrTreat.prototype.sendMessageToUserConnected = function(message,attachments,dm){
	this.slackObj.getChannelGroupOrDMByID(dm.channel.id).postMessage({username:this.botface.currentName,icon_url:this.botface.currentImage,as_user:true,text:this.addHumor(message),attachments:attachments});

};

TrickOrTreat.prototype.sendMsgToAllChannelsSYNC = function(msg){
	var channelIds =  Object.keys(this.getCurrentChannels());
	for(var i=0;i<channelIds.length;i++){
		this.sendMessageToChannelSYNC(this.slackObj.getChannelGroupOrDMByID(channelIds[i]),msg);
	}
};

TrickOrTreat.prototype.sendMsgToAllChannels = function(msg,attachments){
	var channelIds =  Object.keys(this.getCurrentChannels());
	for(var i=0;i<channelIds.length;i++){
		this.sendMessageToChannel(this.slackObj.getChannelGroupOrDMByID(channelIds[i]),msg,attachments);
	}
};

// === GETTING CHANNEL INFO

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

// === ERRORS & LOGS & WHATNOT

TrickOrTreat.prototype.slackObjError = function(error){
	this.log('error',error.msg);
	process.exit(1);
};

TrickOrTreat.prototype.error = function(error){
	this.log('error',error.stack);
	if(this.slackObj.connected){
		this.sendMsgToAllChannelsSYNC("An error has occured and I need to restart, please stand by!\n\n(Tell @"+this.config.superadmins.join(" & @")+" to check the logs)");	
	}else{
		this.log('error',"I cannot send out error messages without a slack connection!");
	}
	process.exit(1);
};

TrickOrTreat.prototype.addHumor = function(msg){
	var edited = msg;
	if(chance.bool({likelihood: 10})){
		edited = edited+" "+chance.pick(this.treatStrings.bleepsAndBloopsEnd);	
	}

	if(chance.bool({likelihood: 10})){
		edited = chance.pick(this.treatStrings.bleepsAndBloopsStart)+" "+edited;	
	}
	
	return edited;	
};

TrickOrTreat.prototype.pluralize = function(word,amount){
	var words = {
		'candy':'candies'
	};

	if(word in words){
		if(amount == 1){
			return word;
		}
		return words[word];
	}
	return word;
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

