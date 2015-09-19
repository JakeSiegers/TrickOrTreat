var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
	name:'Trick or Treat',
	description: 'A Slack chat bot that hands out candy!',
	script: 'C:\\Server\\Data\\ApacheData\\TrickOrTreatReWrite\\init.js'
});

svc.on('install',function(){
	console.log("Trick or Treat installed and started!")
	svc.start();
});

svc.on('alreadyinstalled ',function(){
	console.log("Trick or Treat service is already installed")
});


svc.install();