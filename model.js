function TOTModel(){
	this.config = require('./config');
	this.mysql = require('mysql');
	this.dbc = this.mysql.createConnection({
		host:this.config.mysqlHost,
		user:this.config.mysqlUser,
		password:this.config.mysqlPass
	});
}

TOTModel.prototype.addCandy = function(name){
	return "Adding Candy: "+name;
}

module.exports = new TOTModel