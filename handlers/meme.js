const _       = require('lodash');
const rp      = require('request-promise');
const log4js  = require('log4js');
const helpers = require('../util/helpers.js');
const LOG     = log4js.getLogger('meme');

module.exports = {
  name: 'meme',
  trigger: '.meme',
  handler: meme,
};

// Imgflip requires a username and password belonging to the key owner
const MEME_USER = process.env.MEME_USER;
const MEME_PASSWORD = process.env.MEME_PASSWORD;
const API_URL = 'http://version1.api.memegenerator.net//Instance_Create';
let MEME_IMAGES = null;

// Default top and bottom text in case we aren't able to pull suitable candidates from chat
let topText = 'GOOD';
let bottomText = 'SHIT';

async function meme(message) {

  // Instead of just throwing a console error or timing out of the values aren't set, we can send a message and then quit
  if(!MEME_USER){
    LOG.error('Meme generator username not set!');
    message.channel.send('Meme generator username not set!');
    return;
  } else if (!MEME_PASSWORD) {
    LOG.error('Meme generator password not set!');
    message.channel.send('Meme generator password not set!');
    return;
  }


  const messages = await helpers.getMessages(message);
  top_text = helpers.randomUserMessage(messages).content;
  bottom_text = helpers.randomUserMessage(messages).content;

  // Before we make the macro, we need to query the API and find an image to use.
  //     If we've already got cached generator results, we skip this step.

  if (!MEME_IMAGES) {
    LOG.info("Fetching & caching meme images");
    const generatorOptions = {
      uri: `https://api.imgflip.com/get_memes`,
      json: true
    };
    MEME_IMAGES = await rp.get(generatorOptions).catch(error => {
      // Message if we can't connect to the API for some reason
      LOG.error(error);
      message.channel.send("Encountered an error while connecting to the world meme database.");
      return;
    });
  }
  const memeImage = _.sample(MEME_IMAGES['data']['memes']);

  // Now that we've gotten an image, we can send our options to the meme forge and build our dark creation
  const uri = `https://api.imgflip.com/caption_image`;
  const options = {
    uri: uri,
    json: true,
    qs: {
      username: MEME_USER,
      password: MEME_PASSWORD,
      text0: top_text,
      text1: bottom_text,
      template_id: memeImage['id']
    },
  };
  rp.get(options)
    .then(meme => {
      // The API will spit back a bunch of stuff, namely the URL of the macro it just made
      message.channel.send(meme['data']['url']);
    })
    .catch(error =>{
      // This will catch when we are able to query the generator, but the macro creation fails for some reason
      //     As a fun treat, we can still send the top and bottom text of our meme-to-be to the channel
      LOG.error(error);
      message.channel.send("Encountered an error while connecting to the world meme database.");
    });
}
