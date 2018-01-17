const log4js  = require('log4js');
const LOG     = log4js.getLogger('helpers');
const format  = require('format');
const _       = require('lodash');
const emojiRegex = require('emoji-regex');

// Using getMessages will automatically use already cached messages when available,
//     and will fetch more messages only if needed. This way we don't have to rely
//     on the promise function structure every time we want to retrieve a message
exports.getMessages = async function getMessages(message) {

  // Current messages in the Discord client's cache
  let cachedMessages = message.channel.messages;
  
  // If there are only a couple of items in the cache...
  if (cachedMessages.array().length < 20) {
    // LOG.info('Message cache empty for this channel; fetching messages.');
    // Use fetchMessages() to get messages from before we started caching
    cachedMessages = await message.channel.fetchMessages({limit: 100});
    // LOG.info('Caching complete. Now storing ' + cachedMessages.array().length + ' messages.');
  }

  return cachedMessages;
}


// Randomly look through all results until we get a message that 
//     isnt bot generated, isn't a bot command, and the message content isn't blank
exports.randomUserMessage = function filterMessage(messages, options = {}) {
  // Shuffle messages first
  let newMessages = _.shuffle(messages.array());
  // Default to first message
  let found = newMessages[0];
  
  // Skip loop if first message matches. Otherwise, go through all messages
  //     until we find a suitable math
  let i = 1;
  let isNatural = true;

  while ( (found.author.bot || found.content.startsWith('.') || found.content.trim() === '' || !isNatural) && i < newMessages.length) {
    found = newMessages[i];

    // Checks to see if message meets any of the following conditions: 
    //    - Consists wholly of a URL
    if (options['naturalLanguage']) {
      const urlTest = new RegExp(/(https?:\/\/[^\s]+)/g);
      let foundUrlTest = found.content.replace(urlTest, function(match){return match.replace(urlTest,'')});
      if (foundUrlTest === '') {
        isNatural = false;
      } else {
        isNatural = true;
      }
    }

    // Replacing custom emoji references with name of emoji
    if (options['replaceCustomEmojis']) {
      found.content = exports.replaceCustomEmojis(found.content);
    }

    // Removing normal unicode emojis
    if (options['removeEmojis']) {
      LOG.info('Filtering ' + found.content);
      found.content = exports.removeEmojis(found.content);
      LOG.info('Result: ' + found.content);
    }

    i++;

    // Debug during production
    if (i === newMessages.length) {
      LOG.info('Reached end of messages');
    }
  }

  return found;
}

exports.replaceUsernames = function replaceUsername(message) {
  // Matching strings that look like '<@3478942738932>'
  const userTest = new RegExp(/<@\d+>/, 'g');

  // Looping through the message and replacing all instances of username references
  message.content = message.content.replace(userTest, function(match) {
    // Could be done with substrings but this is easier to read
    match = match.replace('<@', '').replace('>','');

    // Look up referenced user by id and replace with username
    return message.mentions.users.find('id', match).username
  });
  return message;
}

// Removing standard unicode emojis
exports.removeEmojis = function removeEmojis(messageText) {
  LOG.info("Checking message: " + messageText);
  const regex = emojiRegex();
  const emojiMatches = messageText.match(regex);
  if (emojiMatches) {
    emojiMatches.forEach(function(match) {
      messageText = messageText.replace(match, '');
    });
  }
  return messageText;
}

// Replacing Discord custom emojis with just the name of the emoji
exports.replaceCustomEmojis = function replaceCustomEmojis(message) {
 // Matching strings that look like '<:emojiname:3478942738932>'
  const emojiTest = new RegExp(/<:\w+:\d+>/, 'g');

  // Looping through the message and replacing all instances of username references
  const emojiMatches = message.match(emojiTest);
  if (emojiMatches) {
    emojiMatches.forEach(function(match){
      let emoji = match.replace('<:','').replace(/:\d+/, '').replace('>', '');
      message = message.replace(match, emoji);
    });
  }
  
  return message; 
}