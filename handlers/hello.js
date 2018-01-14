/**
 * This handler says hello.
 */

function hello(message) {
  message.reply('Hello!');
}

module.exports = {
  name: 'hello',
  command: '.hello',
  handler: hello
};
