/**
 * This handler repeats everything said to it.
 */

module.exports = {
  name: 'repeat',
  command: ':repeat',
  handler: repeat
};

function repeat(client, nick, to, text, message) {
  console.log('nick: ' + nick);
  console.log('to: ' + to);
  console.log('text: ' + text);
  console.log('message: ' + message);
};
