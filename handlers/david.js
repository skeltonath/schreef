const _      = require('lodash');
const format = require('format');
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

async function david(message) {
  const messages = await helpers.getMessages(message);
  const randomMessage = helpers.randomUserMessage(messages).content;
  let words = randomMessage.split(" ");

  words = _.map(words, (word) => {
    const fn = getRandomModifier();
    return fn(word);
  });

  words.push(Math.random() > .5 ? "lol" : "haha");
  const davidifiedString = words.join(" ");
  message.channel.send("David: " + davidifiedString);
}

function getRandomModifier() {
  const random = Math.random();
  if (random < .2) {
    return w => w;
  } else if (random >= .2 && random < .4) {
    return scramble;
  } else if (random >= .4 && random < .6) {
    return addChars;
  } else if (random >= .6 && random < .8) {
    return removeChars;
  } else if (random >= .8 && random < 1) {
    return capitalizationSwap;
  }
}

// randomly swaps position of two adjacent characters
function scramble(word) {
  helpers.debug("Scrambling word: " + word);
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
  helpers.debug("Result: " + newWord);
  return newWord;
}

function addChars(word) {
  helpers.debug("Addings chars to word: " + word);
  let newWord = "";
  for (let i = 0; i < word.length; i++) {
    let random = Math.random();
    newWord += word.charAt(i);
    if (random < config.addCharChance) {
      newWord += getRandomChar();
    }
  }
  helpers.debug("Result: " + newWord);
  return newWord;
}

function removeChars(word) {
  helpers.debug("Removing chars from word: " + word);
  let newWord = "";
  for (let i = 0; i < word.length; i++) {
    let random = Math.random();
    newWord += random < config.removeCharChance ? "" : word.charAt(i);
  }
  helpers.debug("Result: " + newWord);
  return newWord;
}

function capitalizationSwap(word) {
  helpers.debug("Capitalization swapping word: " + word);
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
  helpers.debug("Result: " + newWord);
  return newWord;
}

function getRandomChar() {
  const min = Math.ceil(33);
  const max = Math.floor(127);
  const charCode = Math.floor(Math.random() * (max - min)) + min;
  return String.fromCharCode(charCode);
}