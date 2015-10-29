var _      = require('lodash');
var log4js = require('log4js');
var format = require('format');

var LOG = log4js.getLogger('replace');

/**
 * This module replaces text in a previous message.
 */
module.exports = {
  name: 'replace',
  command: ':r',
  handler: replace
};

function replace(client, nick, to, text, message, params, buffer) {
  var strArray = params[0].split('|');
  var targetStr = strArray[0];
  var replaceStr = strArray[1];

  if (_.size(params) > 1) {
    var targetNick = params[1];
  }

  var targetMsg = _.find(buffer, function(message) {
    var isMatch = _.contains(message.text, targetStr);

    if (targetNick) {
      isMatch = message.nick === targetNick;
    }
    return isMatch;
  });

  if (targetMsg) {
    var newMsg = targetMsg.text.replace(targetStr, replaceStr);
    client.say(to, format('%s meant to say: %s', targetMsg.nick, newMsg));
  } else {
    client.say(to, 'No messages containing that string found');
  }
}
