const _       = require('lodash');
const rp      = require('request-promise');
const log4js  = require('log4js');
const helpers = require('../helpers.js');
const LOG     = log4js.getLogger('meme');

module.exports = {
  name: 'meme',
  command: 'meme',
  handler: meme
};

// Memegenerator requires an API key as well as the username and password belonging to the key owner
const MEMEGENERATOR_API_KEY = process.env.MEMEGENERATOR_API_KEY;
const MEME_USER = process.env.MEME_USER;
const MEME_PASSWORD = process.env.MEME_PASSWORD;
const API_URL = 'http://version1.api.memegenerator.net//Instance_Create';
let MEME_GENERATORS = null;

// Language tagging; for browsing purposes on the memegenerator site
const languageCode = 'en';

// The meme "generator" is actually the background image that is used for the macro. Defaulting to insanity wolf
let generatorID = 45;

// Default top and bottom text in case we aren't able to pull suitable candidates from chat
let top_text = 'GOOD';
let bottom_text = 'SHIT';

async function meme(channel, message, params) {

  // Instead of just throwing a console error or timing out of the values aren't set, we can send a message and then quit
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

  
  const messages = await helpers.getMessages(message);
  top_text = helpers.filterMessages(messages);
  bottom_text = helpers.filterMessages(messages);

  // Before we make the macro, we need to query the API and find a generator to use.
  //     If we've already god cached generator results, we skip this step.
  //     The meme "generator" is actually the background image that is used for the macro.
  //     We query the API for the current top 25 most popular generator images (25 is the max),
  //     and then randomly choose one of those to use.
  if (!MEME_GENERATORS) {
    LOG.info("Fetching meme generators");
    const generatorOptions = {
      uri: `http://version1.api.memegenerator.net//Generators_Select_ByPopular?pageIndex=0&pageSize=25&days=&apiKey=${MEMEGENERATOR_API_KEY}`,
      json: true
    };
    MEME_GENERATORS = await rp.get(generatorOptions).catch(error => {
      // The memegenerator API is not reliable, and goes down often enough for it to be a nuisance. This displays when we can't connect
      //     to the generator; usually after the server process times out. Again, we still have messages so we can still send those
      LOG.error(error);
      channel.send("Error retrieving meme generators from His Excellency, President for Life, Field Marshal Gaylord K. Memelord, VC, DSO, MC, Eternal Ruler of Heaven, Earth and the Interwebz, and All Creatures Who Crawl Swim and Fly Upon It, Past, Present and Future, In This and Any Other Dimension, Conqueror of the British Empire in Africa in General and Uganda in Particular, DDS");
      channel.send(_.toUpper(top_text));
      channel.send(_.toUpper(bottom_text));
      return;
    });
  }
  generatorID = _.sample(MEME_GENERATORS.result).generatorID;

  // Now that we've gotten a generator, we can send our options to the meme forge and build our dark creation
  const uri = `${API_URL}?apiKey=${MEMEGENERATOR_API_KEY}&generatorID=${generatorID}&languageCode=${languageCode}&text0=${top_text}&text1=${bottom_text}&username=${MEME_USER}&password=${MEME_PASSWORD}`;
  const options = {
    uri: uri,
    json: true
  };
  rp.get(options)
    .then(meme => {
      // The API will spit back a bunch of stuff, namely the URL of the macro it just made
      channel.send(meme.result.instanceImageUrl);
    })
    .catch(error =>{
      // This will catch when we are able to query the generator, but the macro creation fails for some reason
      //     As a fun treat, we can still send the top and bottom text of our meme-to-be to the channel
      LOG.error(error);
      channel.send("Encountered an error while connecting to the world meme database; we've been set up!");
      channel.send(_.toUpper(top_text));
      channel.send(_.toUpper(bottom_text));
    });
}