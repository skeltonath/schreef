const _      = require('lodash');
const log4js = require('log4js');
const format = require('format');

const LOG = log4js.getLogger('replace');

/**
 * This module replaces text in a previous message.
 */
module.exports = {
  name: 'replace',
  command: 'r',
  handler: replace
};

function replace(channel, message, params) {
  params = params.split('/');
  let targetStr = params[0];
  let replaceStr = params[1];
  let flags = [];
  let targetUser = '';

  if (params.length > 2) {
    flags = params[2].trim().toLowerCase();

    if (flags.search(/^(g|i|gi|ig)?$/) === -1) {
      client.say(to,
        format('Invalid flags: %s. Only g (global) and i (ignore case) are allowed.', flags));
      return;
    }
  }

  if (params.length > 3) {
    targetUser = params[3];
  }

  if (flags.includes('i')) {
    targetStr = targetStr.toLowerCase();
  }

  channel.fetchMessages({ before: message.id })
    .then(messages => {
      let targetMessage = findMatchingMessage(messages, targetStr, flags, targetUser);
      if (targetMessage) {
        let re = new RegExp(targetStr, flags);
        let newMessage = targetMessage.content.replace(re, replaceStr);
        channel.send(format('%s meant to say: %s', targetMessage.author.username, newMessage));
      } else {
        channel.send('No messages containing that string found');
      }
    })
    .catch(error => {
      LOG.error(error);
      channel.send('Error getting messages for channel');
    });
}

function findMatchingMessage(messages, target, flags, targetUser) {
  return messages.find(message => {
    let content = message.content;

    if (content.startsWith('.')) return false;

    if (flags.includes('i')) content = content.toLowerCase();

    let isMatch = message.content.includes(target);

    if (targetUser) {
      isMatch = isMatch && message.author.username === targetUser
    }

    return isMatch;
  });
}
