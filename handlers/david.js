const _      = require('lodash');
const helpers = require('../util/helpers.js');

module.exports = {
  name: 'david',
  trigger: '.david',
  handler: david,
};

// refers to the odds of modifying an individual character
// NOT the odds of that particular modification happening to a word
const config = {
  addCharChance: .3,
  capitalizationSwapChance: .4,
  scrambleChance: .4,
  removeCharChance: .2,
}

const modifiers = [
  w => w,
  scramble,
  addChars,
  removeChars,
  capitalizationSwap
];

async function david(message) {
  const messages = await helpers.getMessages(message);
  const randomMessage = helpers.randomUserMessage(messages).content;
  let words = randomMessage.split(" ");

  words = _.map(words, (word) => {
    const fn = _.sample(modifiers);
    return fn(word);
  });

  words.push(Math.random() > .5 ? "lol" : "haha");
  const davidifiedString = words.join(" ");
  message.channel.send("David: " + davidifiedString);
}

// randomly swaps position of two adjacent characters
function scramble(word) {
  helpers.debug(`Scrambling words: ${word}`);
  let newWord = "";
  for (let i = 0; i < word.length - 1; i += 2) {
    let random = Math.random();
    if (random < config.scrambleChance) {
      newWord += word.charAt(i + 1);
      newWord += word.charAt(i);
    } else {
      newWord += word.substring(i, i + 2);
    }
  }
  helpers.debug(`Result: ${newWord}`);
  return newWord;
}

function addChars(word) {
  helpers.debug(`Adding chars to word: ${word}`);
  let newWord = "";
  for (let i = 0; i < word.length; i++) {
    let random = Math.random();
    newWord += word.charAt(i);
    if (random < config.addCharChance) {
      newWord += String.fromCharCode(_.random(33, 126));
    }
  }
  helpers.debug(`Result: ${newWord}`);
  return newWord;
}

function removeChars(word) {
  helpers.debug(`Removing chars from word: ${word}`);
  let newWord = "";
  for (let i = 0; i < word.length; i++) {
    let random = Math.random();
    newWord += random < config.removeCharChance ? "" : word.charAt(i);
  }
  helpers.debug(`Result: ${newWord}`);
  return newWord;
}

function capitalizationSwap(word) {
  helpers.debug(`Capitalization swapping word: ${word}`);
  let newWord = "";
  for (let i = 0; i < word.length; i++) {
    let random = Math.random();
    let curChar = word.charAt(i);
    if (random < config.capitalizationSwapChance) {
      newWord += 
        curChar === curChar.toUpperCase() ? 
          curChar.toLowerCase() : 
          curChar.toUpperCase();
    } else {
      newWord += curChar;
    }
  }
  helpers.debug(`Result: ${newWord}`);
  return newWord;
}