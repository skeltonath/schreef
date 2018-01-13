const _ = require('lodash');
const rp = require('request-promise');
const log4js = require('log4js');

const LOG = log4js.getLogger('meme');


module.exports = {
  name: 'meme',
  command: 'meme',
  handler: meme,
};

// Memegenerator requires an API key as well as the username and password belonging to the key owner
const MEMEGENERATOR_API_KEY = process.env.MEMEGENERATOR_API_KEY;
const MEME_USER = process.env.MEME_USER;
const MEME_PASSWORD = process.env.MEME_PASSWORD;
const API_URL = 'http://version1.api.memegenerator.net//Instance_Create';

// Language tagging; for browsing purposes on the memegenerator site
const languageCode = 'en';

// The meme "generator" is actually the background image that is used
//     for the macro. Defaulting to insanity wolf
let generatorID = 45;

// Default top and bottom text in case we aren't able to pull suitable candidates from chat
let topText = 'GOOD';
let bottomText = 'SHIT';

function meme(channel, message) {
  // Instead of just throwing a console error or timing out of the values
  //     aren't set, we can send a message and then quit
  if (!MEME_USER) {
    LOG.error('Meme generator username not set!');
    channel.send('Meme generator username not set!');
    return;
  } else if (!MEME_PASSWORD) {
    LOG.error('Meme generator password not set!');
    channel.send('Meme generator password not set!');
    return;
  } else if (!MEMEGENERATOR_API_KEY) {
    LOG.error('Meme generator API key not set!');
    channel.send('Meme generator API key not set!');
    return;
  }

  // Pulling messages from the channel to populate the meme
  //     Limiting search to the last 100 messages (the max for the fetchMessages() function)
  channel.fetchMessages({ before: message.id, limit: 100 })
    .then((messages) => {
      // Setting the new top and bottom text for the macro
      topText = findMessage(channel, messages).content;
      bottomText = findMessage(channel, messages).content;
    })
    .catch((error) => {
      // For some reason, if we run into an issue when finding the messages,
      //     we will let the user know and then use our fallbacks
      LOG.error(error);
      channel.send('Error getting messages for channel. Using default.');
    });

  // Before we make the macro, we need to query the API and find a generator to use.
  //     The meme "generator" is actually the background image that is used for the macro.
  //     We query the API for the current top 25 most popular generator images (25 is the max),
  //     and then randomly choose one of those to use.
  const generatorOptions = {
    uri: `http://version1.api.memegenerator.net//Generators_Select_ByPopular?pageIndex=0&pageSize=25&days=&apiKey=${MEMEGENERATOR_API_KEY}`,
    json: true,
  };
  rp.get(generatorOptions).then((generators) => {
    generatorID = _.sample(generators.result).generatorID;

    // Now that we've gotten a generator, we can send our options to the
    //     meme forge and build our dark creation
    const uri = `${API_URL}?apiKey=${MEMEGENERATOR_API_KEY}&generatorID=${generatorID}&languageCode=${languageCode}&text0=${topText}&text1=${bottomText}&username=${MEME_USER}&password=${MEME_PASSWORD}`;
    const options = {
      uri,
      json: true,
    };
    rp.get(options)
      .then((memeImage) => {
        // The API will spit back a bunch of stuff, namely the URL of the macro it just made
        channel.send(memeImage.result.instanceImageUrl);
      })
      .catch((error) => {
        // This will catch when we are able to query the generator, but the macro
        //     creation fails for some reason. As a fun treat, we can still send
        //     the top and bottom text of our meme-to-be to the channel
        LOG.error(error);
        channel.send("Encountered an error while connecting to the world meme database; we've been set up!");
        channel.send(_.toUpper(topText));
        channel.send(_.toUpper(bottomText));
      });
  })
    .catch((error) => {
    // The memegenerator API is not reliable, and goes down often enough for it to
    //     be expected. This displays when we can't connect to the generator;
    //     usually after the server process times out. Again, we still have messages
    //      so we can still send those
      LOG.error(error);
      channel.send('Error retrieving meme generators from His Excellency, President for Life, Field Marshal Gaylord K. Memelord, VC, DSO, MC, Eternal Ruler of Heaven, Earth and the Interwebz, and All Creatures Who Crawl Swim and Fly Upon It, Past, Present and Future, In This and Any Other Dimension, Conqueror of the British Empire in Africa in General and Uganda in Particular, DDS');
      channel.send(_.toUpper(topText));
      channel.send(_.toUpper(bottomText));
    });
}

// From the returned messages from discord, we will randomly choose one of those
function findMessage(channel, messages) {
  let found = messages.random();
  // Randomly look through all results until we get a message that isn't
  //     bot generated or a bot command
  let i = 0;
  while ((found.author.bot || found.content.startsWith('.')) && i < messages.size) {
    found = messages.random();
    i++;
  }
  return found;
}
