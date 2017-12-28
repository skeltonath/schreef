/**
 * This handler says hello.
 */

module.exports = {
  name: 'hello',
  command: ':hello',
  handler: hello
};

function hello(channel, message, params) {
  channel.send('Hello!');
};
