const _ = require('lodash');
const helpers = require('../util/helpers.js');

module.exports = {
  name: 'david',
  trigger: '.david',
  handler: david,
};

// refers to the odds of modifying an individual character
// NOT the odds of that particular modification happening to a word
const config = {
  addCharChance: 0.3,
  capitalizationSwapChance: 0.4,
  scrambleChance: 0.4,
  removeCharChance: 0.2,
};

const modifiers = [
  w => w,
  scramble,
  addChars,
  removeChars,
  capitalizationSwap,
];

async function david(message) {
  const messages = await helpers.getMessages(message);
  const randomMessage = helpers.randomUserMessage(messages).content;
  let words = randomMessage.split(' ');

  words = _.map(words, (word) => {
    const fn = _.sample(modifiers);
    helpers.debug(`Processing word: ${word}`);
    word = fn(word.split('')).join('');
    helpers.debug(`Result: ${word}`);
    return word;
  });

  words.push(Math.random() > 0.5 ? 'lol' : 'haha');
  const davidifiedString = words.join(' ');
  message.channel.send(`David: ${davidifiedString}`);
}

// randomly swaps position of two adjacent characters
function scramble(word) {
  for (let i = 0; i < word.length - 1; i += 2) {
    const random = Math.random();
    if (random < config.scrambleChance) {
      const tmp = word[i];
      word[i] = word[i + 1];
      word[i + 1] = tmp;
    }
  }
  return word;
}

function addChars(word) {
  for (let i = 0; i < word.length; i++) {
    const random = Math.random();
    if (random < config.addCharChance) {
      word.splice(i, 0, String.fromCharCode(_.random(33, 126)));
      i++;
    }
  }
  return word;
}

function removeChars(word) {
  for (let i = 0; i < word.length; i++) {
    const random = Math.random();
    if (random < config.removeCharChance) {
      word.splice(i, 1);
      i--;
    }
  }
  return word;
}

function capitalizationSwap(word) {
  for (let i = 0; i < word.length; i++) {
    const random = Math.random();
    if (random < config.capitalizationSwapChance) {
      const curChar = word[i];
      word[i] =
        curChar === curChar.toUpperCase() ?
          curChar.toLowerCase() :
          curChar.toUpperCase();
    }
  }
  return word;
}
