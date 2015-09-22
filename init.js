var TrickOrTreat = require('./src/TrickOrTreat.js');
var trt = new TrickOrTreat();

process.on('uncaughtException', function(error) {
	trt.error(error);
});

process.on('exit',function(){
	trt.sendMsgToAllChannelsSYNC("Someone is turning me off - Please stand by!");
	process.exit(0);
});

process.on('SIGINT',function(){
	trt.sendMsgToAllChannelsSYNC("Someone is turning me off (via SIGINT)- Please stand by!");
	process.exit(0);
});

process.on('SIGTERM',function(){
	trt.sendMsgToAllChannelsSYNC("Someone is turning me off (via SIGTERM)- Please stand by!");
	process.exit(0);
});
