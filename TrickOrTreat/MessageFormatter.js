function MessageFormatter(){
	this.trt = require('./Core');
	this.strings = require('./Strings');
}

MessageFormatter.prototype.init = function(robot){
	this.trt.init(robot);
};

MessageFormatter.prototype.getLeaders = function(){
	return this.trt.leaders().then(function(rows){
		var leaderStr = 'Top 10 Players\n'
		for(var i in rows){
			leaderStr += rows[i]['rank']+') '+rows[i]['playerName']+' with '+rows[i]['total']+' candies\n';
		}
		return leaderStr;
	});
};

MessageFormatter.prototype.play = function(){
	return this.trt.play().then(function(){
		return 'You played trt';
	});
};

MessageFormatter.prototype.topic = function(msg){
	var adj = msg.random(this.strings.adjective);
	var first = adj.substr(0,1);
	if(first == 'a' || first == 'e' || first == 'i' || first == 'o' || first == 'u'){
		var a = 'an';
	}else{
		var a = 'a';
	}
	return '@'+msg.message.user.name+' That\'s '+a+' '+adj+' topic';
};

module.exports = new MessageFormatter();