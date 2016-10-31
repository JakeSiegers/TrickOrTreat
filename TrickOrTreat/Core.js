var Promise = require("bluebird");

function Core(){
    //this.config = require('./config');
	this.model = require('./Model');
}

Core.prototype.init = function(robot){
	this.robot = robot;
	this.model.init(robot);
};

Core.prototype.trt = function(){

};

Core.prototype.leaders = function(){
	return this.model.getLeaders();
};

module.exports = new Core();