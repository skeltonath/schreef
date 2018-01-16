const _      = require('lodash');
const log4js = require('log4js');
const format = require('format');
const LOG = log4js.getLogger('goodshit');
const helpers = require('../util/helpers.js');

module.exports = {
  name: 'goodshit',
  trigger: '.gs',
  handler: goodshit,
};

// some go౦ԁ sHit that we want to randomly pull from
const GOOD_SHIT_ARRAY = [
  'good shit',
  '(chorus: ʳᶦᵍʰᵗ ᵗʰᵉʳᵉ)',
  'go౦ԁ sHit',
  'НO0ОଠＯOOＯOОଠଠOoooᵒᵒᵒᵒᵒᵒᵒᵒᵒ',
  '👌',
  '✔',
  'if i do ƽaү so my self',
  'Good shit',
  '👌👀👌👀',
  '👀',
  '💯',
  '💯 💯',
  '✔💯✔💯✔💯✔💯',
  'good ✔',
  'right✔there',
  'right👌there',
  'mMMMMᎷМ',
  '🍕🍅🍕🍅 ',
  'sign me the fuck up',
  'oh👌fuck👌',
  'oh👌shit👌',
  'fuck👌yes👌',
  '(socrates died for real)',
  '(🅱ocrates died for real)',
  '🍆',
  '🍆💦',
  '😂',
  '😂😂',
  '😻',
  '👹',
  '👽',
  '☠',
  '✌',
  '✌✌',
  '👏👏',
  '🙌',
  '🇺🇸',
  '🐍',
  '👈',
  '👉',
  '👇',
  '👐',
  '🤜🤛',
  'mm',
  'ᎷᎷhm',
  'oh💯yes',
  'my🐸dude',
  'n౦౦t',
  'n౦౦t no౦t',
  '౦h yes',
  'good 🅱hit',
  'my 🅱igga',
];

// Only param to retrieve is the message text; anything after the command
async function goodshit(message) {

  // Pull messages from cache for fallback if no message is specified
  const messages = await helpers.getMessages(message);
  const fallback = helpers.randomUserMessage(messages);
  const msgText = params != '' ? params : fallback.content;
  const words = _.words(msgText,  /[^, ]+/g);

  const newWords = [];

  // For every word in the message...
  _.each(words, (word) => {
    // Get some random numbers to figure out how many go౦ԁ sHits to put before and after the word
    const goodshitBefore = _.random(0, 2);
    const goodshitAfter = _.random(0, 3);

    // Before the word, put a random selection from the go౦ԁ sHit array, a random number of times
    _.each(_.range(goodshitBefore), () => {
      const goodshitText = _.sample(GOOD_SHIT_ARRAY);
      newWords.push(goodshitText);
    });

    newWords.push(word);

    // Always append one of the original words with an a-okay
    newWords.push('👌');

    // Random sampling after the word
    _.each(_.range(goodshitAfter), () => {
      const goodshitText = _.sample(GOOD_SHIT_ARRAY);
      newWords.push(goodshitText);
    });
  });

  // stick all the words together
  const newText = newWords.join(' ');

  // Sending message
  // if the message is longer than 2000 characters, we have to slice it to fit Discord's limit
  message.channel.send(newText.length > 2000 ? newText.substring(0, 2000) : newText);
}
