// Commands:
//  hubot - You go trick or treating
//  hubot leaders - Get the top 10 players

/**
 * @param  robot
 */
module.exports = function(robot){
    var trt = require('../TrickOrTreat/TrickOrTreat');
	trt.init(robot);

	robot.hear(/!trt/,function(msg){
		msg.reply("!trt has been changed to trt");
	});

	robot.topic(function(res){
		res.send(trt.topic(res));
	});

    robot.hear(/^trt$/,function(msg){
		trt.play().then(function(response){
		    msg.reply(response);
	    });
    });

    robot.respond(/leaders/i,function(msg){
        trt.getLeaders().then(function(leaders){
	        msg.reply(leaders);
        });
    });

    robot.respond(/is it a weekend\?/i, function(msg){
        var today = new Date();
        msg.reply(today.getDay() === 0 || today.getDay() === 6 ? "YES" : "NO");
    });

	robot.respond(/boat/i,function(msg){
		//FANCY MESSAGE EXAMPLE
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
	});

	robot.error(function(error,resp){
		robot.logger.error('DOES NOT COMPUTE');
		if(resp){
			resp.reply("I'm afraid I cannot do that");
		}
	});
};


