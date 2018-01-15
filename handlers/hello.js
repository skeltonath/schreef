/**
 * This handler says hello.
 */

function hello(message) {
  message.channel.send('Hello!');
}

module.exports = {
  name: 'hello',
  trigger: '.hello',
  handler: hello,
};
