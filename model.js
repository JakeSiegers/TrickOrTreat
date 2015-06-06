function TOTModel(){
	this.config = require('./config');
	this.mysql = require('mysql');
	this.dbc = this.mysql.createConnection({
		host:config.mysqlHost,
		user:config.mysqlUser,
		password:config.mysqlPass
	});
}

TOTModel.prototype.addCandy = function(name){
	return "Adding Candy: "+name;
}

module.exports = new TOTModel