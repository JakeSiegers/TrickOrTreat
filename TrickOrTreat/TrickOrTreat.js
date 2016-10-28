var Promise = require("bluebird");
var mysql = require('promise-mysql');

function TrickOrTreat(){
    this.config = require('./config');
    this.initMysql();
}

TrickOrTreat.prototype.initMysql = function(){
    return mysql.createConnection(this.config.mysql).bind(this)
        .then(function(connection){
            this.dbc = connection;
            console.log('mysql connected');
        });
};

TrickOrTreat.prototype.leaders = function(){
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
    return this.dbc.query(leaderQuery)
};

module.exports = new TrickOrTreat();