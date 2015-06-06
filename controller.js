function TOTController(){
	this.model = require('./model');
}

TOTController.prototype.addCandy = this.model.addCandy;