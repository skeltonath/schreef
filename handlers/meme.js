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
let top_text = 'GOOD';
let bottom_text = 'SHIT';
function meme(channel, message, params) {

  if(!MEME_USER){
    LOG.error('Meme generator username not set!');
    channel.send('Meme generator username not set!');
    return;
  } else if(!MEME_PASSWORD){
    LOG.error('Meme generator password not set!');
    channel.send('Meme generator password not set!');
    return;
  } else if(!MEMEGENERATOR_API_KEY){
    LOG.error('Meme generator API key not set!');
    channel.send('Meme generator API key not set!');
    return;
  }

  channel.fetchMessages({ before: message.id})
    .then(messages => {
      top_text = findMessage(channel, messages).content;
      bottom_text = findMessage(channel, messages).content;
    })
    .catch(error => {
      LOG.error(error);
      channel.send("Error getting messages for channel. Using default.");
    });

  let op = {
    uri: `http://version1.api.memegenerator.net//Generators_Select_ByPopular?pageIndex=0&pageSize=25&days=&apiKey=${MEMEGENERATOR_API_KEY}`,
    json: true
  };

  rp.get(op).then(generators => {
    generatorID = _.sample(generators.result).generatorID;
    let uri = `${API_URL}?apiKey=${MEMEGENERATOR_API_KEY}&generatorID=${generatorID}&languageCode=${languageCode}&text0=${top_text}&text1=${bottom_text}&username=${MEME_USER}&password=${MEME_PASSWORD}`;
    let options = {
      uri: uri,
      json: true
    };

    rp.get(options)
      .then(meme => {
        channel.send(meme.result.instanceImageUrl);
      })
      .catch(error =>{
        LOG.error(error);
        channel.send("Encountered an error while connecting to the world meme database; we've been set up!");
        channel.send(_.toUpper(top_text));
        channel.send(_.toUpper(bottom_text));
      });
  })
  .catch(error => {
    LOG.error(error);
    channel.send("Error retrieving meme generators from Memelord, Eternal Ruler of Heaven, Earth and the Interwebz, and All Creatures Who Crawl Upon It, Past, Present and Future, In This and Any Other Dimension");
    channel.send(_.toUpper(top_text));
    channel.send(_.toUpper(bottom_text));
  });
}

function findMessage(channel, messages){
  let found = messages.random();
  if(found.author.id == channel.client.user.id || found.content.startsWith('.')){
    found = findMessage(channel, messages);
  }
  return found;
}