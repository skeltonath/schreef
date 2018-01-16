const log4js  = require('log4js');
const LOG     = log4js.getLogger('helpers');
const format  = require('format');
const _       = require('lodash');

// Using getMessages will automatically use already cached messages when available,
//     and will fetch more messages only if needed. This way we don't have to rely
//     on the promise function structure every time we want to retrieve a message
exports.getMessages = async function getMessages(message) {

  // Current messages in the Discord client's cache
  let cachedMessages = message.channel.messages;
  
  // If there are only a couple of items in the cache...
  if (cachedMessages.array().length < 10) {
    LOG.info('Message cache empty for this channel; fetching messages.');
    // Use fetchMessages() to get messages from before we started caching
    cachedMessages = await message.channel.fetchMessages({limit: 100});
  }

  return cachedMessages;
}


// Randomly look through all results until we get a message that 
//     isnt bot generated or a bot command
exports.randomUserMessage = function filterMessage(messages) {
  // Shuffle messages first
  let newMessages = _.shuffle(messages.array());
  
  // Default to first message
  let found = newMessages[0];
  
  // Skip loop if first message matches. Otherwise, go through all messages
  //     until we find a suitable math
  let i = 1;
  while ( (found.author.bot || found.content.startsWith('.')) && i < newMessages.length) {
    found = newMessages[i];
    i++;
  }

  return found;
}

exports.getEmoji = function getEmoji(emoji) {
  return new Promise((resolve, reject) => {

  });
}