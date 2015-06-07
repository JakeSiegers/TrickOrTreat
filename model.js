function TOTModel(){
	this.config = require('./config');
	this.mysql = require('mysql');
	this.dbc = this.mysql.createConnection({
		host:this.config.mysqlHost,
		user:this.config.mysqlUser,
		password:this.config.mysqlPass
	});
	dbc.connect(function(err) {
		console.log(err.code); // 'ECONNREFUSED'
		console.log(err.fatal); // true
	});
}

TOTModel.prototype.addCandy = function(name){
	"Adding Candy: "+name;
	dbc.query('INSERT INTO ',[],function)
}



TOTModel.prototype.getPlayerCandies = function(playerName){
	//dbc.query('INSERT INTO ',[],function)
}

TOTModel.prototype.fatalError = function(errorMsg){
	console.log("===============\n=====ERROR=====\n===============\n"+errorMsg);
	dbc.query('INSERT INTO ',[],function)

	throw new Error("Error Occured: "+errorMsg);
}

module.exports = new TOTModel