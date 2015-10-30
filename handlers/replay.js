var _ = require('lodash');
var log4js = require('log4js');
var format = require('format');
var moment = require('moment-timezone');

var LOG = log4js.getLogger('replay');
var TZ = 'US/Pacific';

/**
 * This module sends a replay of the most recent messages
 * to a user.
 */
module.exports = {
  name: 'replay',
  command: ':replay',
  handler: replay
};

function replay(client, nick, to, text, message, params, buffer) {
  params = params.split(' ');

  if (params.length === 0) {
    client.say(to, 'Please provide number of messages to replay, less than 500');
    return;
  }

  var numMessages = parseInt(params[0], 10);
  if (!_.isFinite(numMessages)) {
    client.say(to, format('Invalid number of messages provided: %s', params[0]));
    return;
  }

  client.say(to, format('%s, I am sending you the last %d messages', nick, numMessages));
  _.forEachRight(_.range(numMessages), function(index) {
    var msg = buffer[index];
    var msgStr = format('[%s] %s: %s',
      moment.tz(msg.timestamp, TZ).format('LTS'), msg.nick, msg.text);
    client.say(nick, msgStr);
  });
}
