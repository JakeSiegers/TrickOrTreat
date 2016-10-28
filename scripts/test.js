// Commands:
//  hubot - You go trick or treating
//  hubot leaders - Get the top 10 players


module.exports = function(robot){
    var trt = require('../TrickOrTreat/TrickOrTreat');

    robot.hear(/^trt$/,function(msg){
		/*
		var  messageData = {
		    channel: msg.message.room,
		    username: 'Boaty McBoatface',
		    icon_emoji: ':boat:',
		    text: 'I\'m on a boat!',
		    as_user: false,
		    attachments: [{
		        author_name: 'Captain',
		        title: 'Captain\'s Log',
				text: 'No land in sight yet...'
		    }]
		};

        msg.send(messageData);
        */
    });

    robot.respond(/leaders/i,function(msg){
        trt.leaders().then(function(rows){
            var leaderStr = 'Top 10 Players\n'
            for(var i in rows){
                leaderStr += rows[i]['rank']+') '+rows[i]['playerName']+' with '+rows[i]['total']+' candies\n';
            }
            msg.reply(leaderStr);
        });
    });

    robot.respond(/is it (weekend|holiday)\s?\?/i, function(msg){
        var today = new Date();

        msg.reply(today.getDay() === 0 || today.getDay() === 6 ? "YES" : "NO");
    });
};