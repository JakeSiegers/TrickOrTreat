var mysql = require('promise-mysql');

function Model(){
	this.config = require('./config');
	this.dbc = null;
}

Model.prototype.init = function(robot){
	this.robot = robot;
	this.initMysql();
};

Model.prototype.initMysql = function(){
	return mysql.createConnection(this.config.mysql).bind(this)
		.then(function(connection){
			this.dbc = connection;
			this.robot.logger.info('MySQL connected');
		});
};


Model.prototype.getLeaders = function(){
	var leaderQuery = `SELECT 
    rank,
    playerName,
    playerId,
    total 
    FROM(
        SELECT 
        @rn:=@rn+1 AS rank,
        playerName,
        playerId,
        total 
        FROM (
            SELECT 
            playerName,
            players.playerId, 
            sum(amount) AS total 
            FROM playercandies 
            JOIN players ON playercandies.playerId = players.playerId 
            GROUP BY players.playerId 
            ORDER BY total DESC
        ) AS leaders,
        (SELECT @rn:=0) AS rankCounter
    ) AS leadersWithRanks
    LIMIT 10`;
	return this.dbc.query(leaderQuery);
};

module.exports = new Model();