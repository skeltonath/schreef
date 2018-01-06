const _       = require('lodash');
const request = require('request');
const rp      = require('request-promise');
const cheerio = require('cheerio');
const format  = require('format');
const log4js  = require('log4js');

const LOG = log4js.getLogger('movie');

/**
 * This module takes a string and inserts into
 * a movie title and description.
 */
module.exports = {
  name: 'movie',
  command: 'movie',
  handler: movie
};

const IMDB_URL = 'http://www.imdb.com/chart/moviemeter';
const OMDB_URL = 'http://www.omdbapi.com';
const IMDB_ID_REGEX = /tt(\d+)/;
const OMDB_API_KEY = process.env.OMDB_API_KEY;
let CACHED_IMDB_IDS = [];

/**
 * Replaces words in a random popular IMBD title
 * with a given string and sends the results to
 * the IRC channel or user.
 */
async function movie(channel, message, params) {
  if (_.isEmpty(CACHED_IMDB_IDS)) {
    LOG.info('IMDB ID cache is empty, populating cache');
    CACHED_IMDB_IDS = await getImdbIds();
  }

  let id = _.sample(CACHED_IMDB_IDS);
  let options = {
    uri: OMDB_URL,
    qs: {
      i: 'tt' + id,
      type: 'movie',
      plot: 'short',
      apikey: OMDB_API_KEY
    },
    json: true
  };

  rp.get(options)
    .then(movie => {
      if (movie.Error) {
        let errorMsg = format('Error getting move details from OMBD: %s', movie.Error);
        channel.send(errorMsg);
        LOG.error(errorMsg);
        return;
      }

      channel.send(format('%s [%s]', replaceRandomWords(movie.Title, params, 1), id));
      channel.send(replaceRandomWords(movie.Plot, params));
    })
    .catch(err => {
      let errorMsg = format('Error getting move details from OMBD: %s', movie.Error);
      channel.send(errorMsg);
      LOG.error(errorMsg);
    });
}

/**
 * Gets a random IMDB ID.
 */
function getImdbIds() {
  let options = {
    url: IMDB_URL,
    transform: cheerio.load
  };

  return new Promise((resolve, reject) => {
    rp.get(options)
      .then($ => {
        let ids = $('.titleColumn')
          .find('a')
          .map((i, el) => {
            let href = $(el).attr('href');
            return IMDB_ID_REGEX.exec(href)[1]
          })
          .get();
        resolve(ids);
      })
      .catch(err => {
        LOG.error(err);
        reject(err);
      });
  });
}

function replaceRandomWords(str, replaceStr, numToReplace) {
  let strArray = str.split(' ');

  if (!numToReplace) {
    numToReplace = _.random(1, strArray.length / 4);
  }

  if (strArray.length == 1) {
    strArray.push(replaceStr);
  } else {
    for (let i = 0; i < numToReplace; i++) {
      let index = _.random(0, strArray.length);
      if (strArray[index + 1] !== replaceStr &&
          strArray[index - 1] !== replaceStr &&
          strArray[index] !== replaceStr) {
        strArray[index] = replaceStr;
      } else {
        i--;
      }
    }
  }
  return strArray.join(' ');
}

