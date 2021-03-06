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


	this.randomSolveMessages = [
		"Ah, yes - I know this one!",
		"Uhm, my sensors say ",
		"That's an easy one, it's",
		"Pfft, easy! That's",
		"Computed your answer to be",
		"I believe the answer is",
		"Your answer is",
		"That's",
		"Duh, it's",
		"Did you even try? It's",
	];

	
	this.help = {
		'!trt':"You go trick or treating",
		'!trt count':"Shows your current candy counts",			
		'!trt leaders':"Shows the top 10 players",
		'!trt rank':"Shows your current rank",
		'!trt help':"Shows this block of text",
		'!trt solve':"Solve math problems!"
	};

	this.bleepsAndBloopsEnd = [
		"*Mechinical Whirring*",
		"*Beep!*",
		"*Boop!*",
		"*cough, er... beep!*",
		"[and your lucky number today is 17]",
		"*BoopBeep!*",
		"[End Of Message] *Buuuurzzzpt*",
		"*Ding!*",
		"*Yippie!*",
		"*Evil Laughter*"
	];

	//These will be for did you know facts soon.
	this.didYouKnow = [
	];

	this.bleepsAndBloopsStart = [
		"*Beep!*",
		"*Boop!*",
		"*Boop! Beep!*",
		"*Ding!*"
	];

	this.okay = [
		"Okay!",
		"Whatever you say, boss",
		"Okdoke",
		"Right away!",
		"Cha-char-charmander!",
		"Sure thing bro",
		"Ok!",
	];

	this.playReminders = [
		"Have you played !trt today?",
		"I'm just checking in to remind you all to play some !trt",
		"Double candy time! (in your dreams)",
		"*cough* play !trt *cough*",
		"Get yer candy here, fresh candy, twice daily!",
	];

	this.alreadyPlayed = [
		"You've already Trick or Treated too many times today!",
		"Nope, no more candy for you today",
		"Sorry, I have to cut you off for now",
		"No more candy for you till tomorrow",
		"I'm only giving out a limited about of candy per person a day",
		"Too much candy can make you sick!",
		"Sorry, all out!",
		"Go away, I'm sleeping!",
		"Please leave a message after the tone... *beep*",
		"No candy for you!",
		"Ask again later",
		"I don't really feel like giving you any more candy",
	];

}
	
module.exports = TreatStrings;