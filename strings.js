//Get ready to move lots of strings over here!
var Chance = require('chance');
var chance = new Chance();

function TreatStrings(){
	this.nonCandies = new Array(
		"Apple",
		"Banana",
		"Toothbrush",
		"Raisins",
		"Loose change",
		"Dental Floss",
		"Toothpicks"
	);

	this.helpHeader = [
		'You need some help?',
		'In need of help?',
		'Here are my commands',
		'I was told you need some help?',
		'Hope this helps you out!'
	];

	this.notAuthorizedMessages = [
		'Sorry, You cannot do that!',
		'OAK: Now is not the time to use that...',
		'You are not authorized to use that command',
	];

	this.randomIntroMessages = [
		"TrickOrTreat is now online",
		"Your friendly neighborhood bot is ready to give out candy",
		"Hi everyone, who wants some candy?",
		"Powering Up!",
		"All Systems [online]"
	];

	
	this.help = {
		'!trt':{
			short:"You go trick or treating",
			long:"You go trick or treating (Assuming you're registered) - this allows you to earn up to three pieces of candy, twice a day."
		},
		'!trt register':{
			short:"Registers your account in order to start playing the game",
			long:"Registers your account in order to start playing the game"
		},
		'!trt count':{
			short:"Shows your current candy counts",
			long:"Shows your current candy counts"
		},
		'!trt give':{
			short:"Usage: !trt give {number} {candy} {player}",
			long:"Usage: !trt give {number} {candy} {player} \n Use this to donate some of your candy to another player - not to be confused with !trt trade"
		},
		'!trt help':{
			short:"Shows this block of text",
			long:"Shows this block of text"
		}
	};

	this.bleepsAndBloopsEnd = [
		"*Mechinical Whurring*",
		"*Beep!*",
		"*Boop!*",
		"*BoopBeep!*",
		"[End Of Message] *Buuuurzzzpt*",
		"*Ding!*",
		"*Yippie!*",
		"*Evil Laughter*",
		"\n(... maybe I'll change my name to "+chance.first()+" ... )"
	];

	this.bleepsAndBloopsStart = [
		"*Beep!*",
		"*Boop!*",
		"*Boop! Beep!*",
		"*Ding!*"
	];
}
	
module.exports = TreatStrings;