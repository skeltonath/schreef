/**
 * This handler is a simple collection of things that David actually says. 
 */

var phrases = [
	"Mount and DEW me.",
	"Lemme grease you up, baby! Aww yeah, you like it.",
	"Is that your DICK in my MOUTH? because I-- aw, fuck.",
	"I am OBSESSED with safety.",
	"[Looking at a tapir] Yeah I'd get freaky with that thing.",
	"That fucking monkey stole my hat. I'm gonna fuck him in half.",
	"Heyyy fella.",
	"Who puts the morgue next to the sewer? Do they fuckin' flush the bodies?",
	"Runnin' through the woods, gonna get fucked by Cannibal Corpse.",
	"It's that guy trying to fuck that cow again!",
	"I am the smartest person in the cereal box.",
	"I'm kinda glad I'm in the sewer because if I shit my pants which my character does because he's a pussy, I can just bend over to the side",
	"Could I attract pigs with truffles? that would be an expensive attraction, truffles are far more expensive than the pigs themselves.",
	"I don't know... am I supposed to cum inside this bottle?",
	"I am sorry father for I have sinned. I fucked the pig",
	"Fill this shit with coal. Then you'll make a fire. Then you'll burn some shit. Then you'll burn... ...Then you'll lick some asshole",
	"The complete darkness of the room just made me realize how drunk I am. and THAT was the real reality check"
];

function _randomFrom(collection) {
	return collection[Math.floor(Math.random()*collection.length)];
}

function david(client, nick, to, text, message) {
  client.say(to, 'David: ' + _randomFrom(phrases));
};

module.exports = {
  name: 'david',
  command: ':david',
  handler: david
};