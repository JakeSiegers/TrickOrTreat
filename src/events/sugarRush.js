function SugarRush(TrickOrTreatOBJ,userObj,callback){
	this.trt = TrickOrTreatOBJ;
	
	this.trt.database.addToCooldown(this.SugarRushResult.bind(this,userObj,callback),1);
}

SugarRush.prototype.SugarRushResult = function(userObj,callback,error,results,fields){
	if(error !== null){ this.trt.error(error); return;}
	callback('You just got a sugar rush, allowing you to trick or treat (1) additional time today! (And this one did not count!)');
};


module.exports = SugarRush;