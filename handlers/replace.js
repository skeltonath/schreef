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
  var params = params.split('|');
  var targetStr = params[0];
  var replaceStr = params[1];

  if (_.size(params) > 2) {
    var flags = params[2];
  }

  if (_.size(params) > 3) {
    var targetNick = params[3];
  }

  var targetMsg = _.find(buffer, function(message) {
    var text = message.text;

    if (_.contains(flags, 'i')) {
      text = text.toUpperCase();
      targetStr = targetStr.toUpperCase();
    }

    var isMatch = _.contains(text, targetStr);

    if (targetNick) {
      isMatch = isMatch && message.nick === targetNick;
    }
    return isMatch;
  });

  if (targetMsg) {
    var re = new RegExp(targetStr, flags);
    var newMsg = targetMsg.text.replace(re, replaceStr);
    client.say(to, format('%s meant to say: %s', targetMsg.nick, newMsg));
  } else {
    client.say(to, 'No messages containing that string found');
  }
}
