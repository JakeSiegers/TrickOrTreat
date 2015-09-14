var mysql = require('mysql');

function TreatDatabase(TrickOrTreatOBJ){
	this.TrickOrTreatOBJ = TrickOrTreatOBJ;
}

TreatDatabase.prototype.initDatabaseConnection = function(callback){
	this.dbc = mysql.createConnection(this.TrickOrTreatOBJ.config.mysql);
	this.dbc.connect(this.databaseConnected.bind(this,callback));
}

TreatDatabase.prototype.databaseConnected = function(callback,error){
	if(error != null){
		this.TrickOrTreatOBJ.log("error",error);
	}
	callback();
}

module.exports = TreatDatabase;
