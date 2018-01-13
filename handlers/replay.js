const _ = require('lodash');
const format = require('format');
const moment = require('moment-timezone');

const TZ = 'US/Pacific';

/**
 * This module sends a replay of the most recent messages
 * to a user.
 */
module.exports = {
  name: 'replay',
  command: ':replay',
  handler: replay,
};

function replay(client, nick, to, text, message, params, buffer) {
  params = params.split(' ');

  if (params.length === 0) {
    client.say(to, 'Please provide number of messages to replay, less than 500');
    return;
  }

  const numMessages = parseInt(params[0], 10);
  if (!_.isFinite(numMessages)) {
    client.say(to, format('Invalid number of messages provided: %s', params[0]));
    return;
  }

  client.say(to, format('%s, I am sending you the last %d messages', nick, numMessages));
  _.forEachRight(_.range(numMessages), (index) => {
    const msg = buffer[index];
    const msgStr = format(
      '[%s] %s: %s',
      moment.tz(msg.timestamp, TZ).format('LTS'), msg.nick, msg.text,
    );
    client.say(nick, msgStr);
  });
}
