/**
 * This handler says hello.
 */

module.exports = {
  name: 'hello',
  command: ':hello',
  handler: hello
};

function hello(client, nick, to, text, message) {
  client.say(to, 'Hello!');
};
