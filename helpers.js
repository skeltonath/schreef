const log4js  = require('log4js');
const LOG     = log4js.getLogger('helpers');
const format  = require('format');
const _       = require('lodash');

exports.getMessage = function getMessage(channel) {
  return new Promise((resolve, reject) => {
  	channel.fetchMessages({limit: 100})
  	.then(messages => {
      messages = shuffle(messages.array());
  	  let found = messages[0];
      // Randomly look through all results until we get a message that isnt bot generated or a bot command
      let i = 1;
      while ( (found.author.bot || found.content.startsWith('.')) && i < messages.length) {
        found = messages[i];
        i++;
      }
      resolve(found);
  	})
  	.catch(error => {
  	  // For some reason, if we run into an issue when finding the messages, we will let the user know and then use our fallbacks
  	  LOG.error(error);
  	  channel.send("Error getting messages for channel. Using default.");
  	});
  });
}

exports.getEmoji = function getEmoji(emoji) {
  return new Promise((resolve, reject) => {

  });
}

function shuffle(o) {
  for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};