function MessageFormatter(){
	this.trt = require('../TrickOrTreat/Core');
}

MessageFormatter.prototype.getLeaders = function(){
	return this.trt.leaders().then(function(rows){
		var leaderStr = 'Top 10 Players\n'
		for(var i in rows){
			leaderStr += rows[i]['rank']+') '+rows[i]['playerName']+' with '+rows[i]['total']+' candies\n';
		}
		return leaderStr;
	});
};

module.exports = new MessageFormatter();