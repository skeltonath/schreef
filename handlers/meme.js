const _       = require('lodash');
const request = require('request');
const rp      = require('request-promise');
const cheerio = require('cheerio');
const format  = require('format');
const log4js  = require('log4js');

const LOG = log4js.getLogger('meme');


module.exports = {
  name: 'meme',
  command: 'meme',
  handler: meme
};

const MEMEGENERATOR_API_KEY = process.env.MEMEGENERATOR_API_KEY;
const MEME_USER = process.env.MEME_USER;
const MEME_PASSWORD = process.env.MEME_PASSWORD;
const API_URL = 'http://version1.api.memegenerator.net//Instance_Create';
const languageCode = 'en';
let generatorID = 45;
const text0 = 'GOOD';
const text1 = 'SHIT';
async function meme(channel, message, params) {

  let op = {
    uri: `http://version1.api.memegenerator.net//Generators_Select_ByPopular?pageIndex=0&pageSize=25&days=&apiKey=${MEMEGENERATOR_API_KEY}`,
    json: true
  };

  rp.get(op).then(generators => {
    generatorID = _.sample(generators.result).generatorID;
    LOG.info(generatorID);
    let uri = `${API_URL}?apiKey=${MEMEGENERATOR_API_KEY}&generatorID=${generatorID}&languageCode=${languageCode}&text0=${text0}&text1=${text1}&username=${MEME_USER}&password=${MEME_PASSWORD}`;
    let options = {
      uri: uri,
      json: true
    };

    rp.get(options)
      .then(meme => {
        // LOG.info(options);
        // LOG.info(meme);
        // LOG.info(meme.result);
        channel.send(meme.result.instanceImageUrl);
      });
  });
}