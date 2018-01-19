const log4js = require('log4js');

const LOG = log4js.getLogger('helpers');
const DEBUG = log4js.getLogger('debug');
const _ = require('lodash');
const emojiRegex = require('emoji-regex');

const isDebug = process.env.MEME_USER;

// Using getMessages will automatically use already cached messages when available,
//     and will fetch more messages only if needed. This way we don't have to rely
//     on the promise function structure every time we want to retrieve a message
exports.getMessages = async function getMessages(message) {
  // Current messages in the Discord client's cache
  let cachedMessages = message.channel.messages;

  // If there are only a couple of items in the cache...
  if (cachedMessages.array().length < 20) {
    // Use fetchMessages() to get messages from before we started caching
    cachedMessages = await message.channel.fetchMessages({ limit: 100 });
  }

  return cachedMessages;
};


// Randomly look through all results until we get a message that
//     isnt bot generated, isn't a bot command, and the message content isn't blank
exports.randomUserMessage = function filterMessage(messages, options = {}) {
  exports.debug('Getting random user message');

  // Shuffle messages first
  const newMessages = _.shuffle(messages.array());
  // Default to first message
  let found = null;

  // Go through all messages until we find a suitable math
  let i = 0;
  let isNatural = true;

  while (!found || ((found.author.bot || found.content.startsWith('.') || found.content.trim() === '' || !isNatural) && i < newMessages.length)) {
    found = newMessages[i];

    // Checks to see if message meets any of the following conditions:
    //    - Consists wholly of a URL
    if (options.naturalLanguage) {
      exports.debug(`Checking "${found.content}" for natural language`);

      const urlTest = new RegExp(/(https?:\/\/[^\s]+)/g);
      const foundUrlTest = found.content.replace(urlTest, match => match.replace(urlTest, ''));
      if (foundUrlTest === '') {
        exports.debug(`"${found.content}" does not pass natural language test`);
        isNatural = false;
      } else {
        exports.debug(`"${found.content}" passes natural language test`);
        isNatural = true;
      }
    }

    // Replacing custom emoji references with name of emoji
    if (options.replaceCustomEmojis) {
      found.content = exports.replaceCustomEmojis(found.content);
    }

    // Removing normal unicode emojis
    if (options.removeEmojis) {
      found.content = exports.removeEmojis(found.content);
    }

    if (options.replaceUsernames) {
      found = exports.replaceUsernames(found);
    }

    i++;

    // Debug during production
    if (i === newMessages.length) {
      LOG.info('Reached end of messages');
    }
  }

  exports.debug([`Returning found message: "${found.content}"`]);
  return found;
};

exports.replaceUsernames = function replaceUsername(message) {
  exports.debug(`Replacing username references in "${message.content}"`);
  // Matching strings that look like '<@3478942738932>'
  const userTest = new RegExp(/<@\d+>/, 'g');

  // Looping through the message and replacing all instances of username references
  message.content = message.content.replace(userTest, (match) => {
    // Could be done with substrings but this is easier to read
    match = match.replace('<@', '').replace('>', '');

    // Look up referenced user by id and replace with username
    return message.mentions.users.find('id', match).username;
  });
  exports.debug(`Returning "${message.content}"`);
  return message;
};

// Removing standard unicode emojis
exports.removeEmojis = function removeEmojis(messageText) {
  exports.debug(`Checking "${messageText}" for standard Unicode emojis`);
  const regex = emojiRegex();
  const emojiMatches = messageText.match(regex);
  if (emojiMatches) {
    emojiMatches.forEach((match) => {
      messageText = messageText.replace(match, '');
    });
  }
  exports.debug(`Returning "${messageText}"`);
  return messageText;
};

// Replacing Discord custom emojis with just the name of the emoji
exports.replaceCustomEmojis = function replaceCustomEmojis(messageText) {
  exports.debug(`Checking "${messageText}" for custom Discord emojis`);
  // Matching strings that look like '<:emojiname:3478942738932>'
  const emojiTest = new RegExp(/<:\w+:\d+>/, 'g');

  // Looping through the message and replacing all instances of username references
  const emojiMatches = messageText.match(emojiTest);
  if (emojiMatches) {
    emojiMatches.forEach((match) => {
      const emoji = match.replace('<:', '').replace(/:\d+/, '').replace('>', '');
      messageText = messageText.replace(match, emoji);
    });
  }
  exports.debug(`Returning "${messageText}"`);
  return messageText;
};

exports.debug = function debug(message) {
  if (isDebug) {
    DEBUG.info(message);
  }
};
