/**
 * This handler says hello.
 */

function hello(channel) {
  channel.send('Hello!');
}

module.exports = {
  name: 'hello',
  command: 'hello',
  handler: hello,
};
