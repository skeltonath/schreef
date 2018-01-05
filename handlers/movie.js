const _       = require('lodash');
const request = require('request');
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

const randomImdbUrl = 'http://www.imdb.com/random/title';
const omdbApiUrl = 'http://www.omdbapi.com/?i=tt%s&type=movie&plot=short&apikey=753dbccc';

/**
 * Replaces words in a random popular IMBD title
 * with a given string and sends the results to
 * the IRC channel or user.
 */
function movie(channel, message, params) {
  let id = getRandomImdbId();
  request(format(omdbApiUrl, id), function(err, res, body) {
    if (!err && res.statusCode == 200) {
      let movie = JSON.parse(body);

      if (movie.Error) {
        channl.send(format('Error getting movie details: %s', movie.Error));
      }

      channel.send(format('%s [%s]', replaceRandomWords(movie.Title, params, 1), id));
      channel.send(replaceRandomWords(movie.Plot, params));
    } else {
      channel.send(format('Error getting movie details: %s', err));
    }
  });
}

/**
 * Gets a random IMDB ID.
 */
function getRandomImdbId() {
  let id = Math.floor(Math.random() * 2155529 + 1);
  return _.padStart(id, 7, '0');
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

