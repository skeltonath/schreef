const rp = require('request-promise');
const log4js = require('log4js');

const LOG = log4js.getLogger('dad');

/**
 * Retrieving a random dad joke from https://icanhazdadjoke.com/
 * via their public API
 */
module.exports = {
  name: 'dad',
  trigger: '.dad',
  handler: dad,
};

const DAD_API = 'https://icanhazdadjoke.com/';

function dad(message) {
  const options = {
    uri: DAD_API,
    json: true,
  };

  rp.get(options).then((joke) => {
    if (joke.joke) {
      message.reply(joke.joke);
    } else {
      LOG.error(joke);
      message.reply('Error receiving joke from Dad Central Station');
    }
  }).catch((err) => {
    LOG.error(err);
    message.reply('Error receiving joke from Dad Central Station');
  });
}
