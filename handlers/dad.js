const _       = require('lodash');
const request = require('request');
const rp      = require('request-promise');
const cheerio = require('cheerio');
const format  = require('format');
const log4js  = require('log4js');

const LOG = log4js.getLogger('dad');

/**
 * This module takes a string and inserts into
 * a movie title and description.
 */
module.exports = {
  name: 'dad',
  command: 'dad',
  handler: dad
};

const DAD_URL = 'https://icanhazdadjoke.com/';

async function dad(channel, message, params) {

let options = {
    uri: DAD_URL,
    json: true
  };

  rp.get(options)
    .then(joke => {
      channel.send(joke.joke);
    });
}