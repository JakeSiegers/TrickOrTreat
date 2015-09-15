var mysql = require('mysql');
var ChanceJS = require('chance');
var chance = new ChanceJS();

function TreatDatabase(TrickOrTreatOBJ){
	this.TrickOrTreatOBJ = TrickOrTreatOBJ;
}

TreatDatabase.prototype.initDatabaseConnection = function(callback){
	this.dbc = mysql.createConnection(this.TrickOrTreatOBJ.config.mysql);
	this.dbc.connect(this.initDatabaseConnectionConnected.bind(this,callback));
	this.dbc.on('error',this.TrickOrTreatOBJ.error.bind(this.TrickOrTreatOBJ));
};

TreatDatabase.prototype.initDatabaseConnectionConnected = function(callback,error){
	if(error !== null){ this.TrickOrTreatOBJ.error(error); }
	callback();
};

// ================= REGISTER USER ============================================================

TreatDatabase.prototype.register = function(userObj,callback){
	this.getUserById(userObj.id,this.registerCheckUserExists.bind(this,userObj,callback))
};

TreatDatabase.prototype.registerCheckUserExists = function(userObj,callback,error,results,fields){
	if(error !== null){ this.TrickOrTreatOBJ.error(error);}
	if(results.length > 0){
		callback(userObj.name+", you're *already* registered! You don't need to register twice, silly!");
	}else{
		this.dbc.query(
			'INSERT INTO players SET playerId = ? , playerName = ? , lastPlayed = NOW()',
			[userObj.id,userObj.name],
			this.registerFinish.bind(this,userObj,callback)
		);
	}
};

TreatDatabase.prototype.registerFinish = function(userObj,callback,error,results,fields){
	if(error !== null){ this.TrickOrTreatOBJ.error(error);}
	callback(userObj.name+", you've been registered!");
};

// ==========================================================================================


// ===========================
// ACTUAL QUERY FUNCTIONS
// ===========================
TreatDatabase.prototype.getUserById = function(id,callback){
	this.dbc.query('SELECT playerId,playerName,lastPlayed FROM players WHERE playerId = ?',[id],callback);
}

TreatDatabase.prototype.insertPlayer = function(id,callback){
	this.dbc.query('SELECT playerId,playerName,lastPlayed FROM players WHERE playerId = ?',
		[id],
		callback()
	);
}

module.exports = TreatDatabase;
