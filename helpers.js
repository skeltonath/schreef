const log4js  = require('log4js');
const LOG     = log4js.getLogger('helpers');
const format  = require('format');
const _       = require('lodash');

// Using getMessages will automatically use already cached messages when available,
//     and will fetch more messages only if needed. This way we don't have to rely
//     on the promise function structure every time we want to retrieve a message
exports.getMessages = async function getMessages(channel) {

  // Current messages in the Discord client's cache
  let cachedMessages = channel.messages.array()[0].channel.messages;
  
  // If there are only a couple of items in the cache...
  if (cachedMessages.array().length < 10) {
    LOG.info('Fetching messages');
    // Use fetchMessages() to get messages from before we started caching
    cachedMessages = await channel.fetchMessages({limit: 100});
  }

  return cachedMessages;
}


// Randomly look through all results until we get a message that 
//     isnt bot generated or a bot command
exports.filterMessages = function filterMessage(messages) {
  // Shuffle messages first
  let newMessages = shuffle(messages.array());
  
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

// Simple array shuffle
function shuffle(o) {
  for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};