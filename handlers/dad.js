const get = require('request-promise');
const log4js = require('log4js');

const log = log4js.getLogger('dad');

const handler = async ({ channel }) => {
  // An attempt will be made
  try {
    const { joke } = await get({ 
      uri: 'https://icanhazdadjoke.com',
      json: true,
    });

    // IT'S FATHER TIME
    channel.send(joke);
  } catch (error) {
    // An attempt was made
    log.error(error);

    channel.send('Error receiving joke from Dad Central Station');
  }
};

module.exports = {
  name: 'dad',
  trigger: '.dad',
  handler,
};
