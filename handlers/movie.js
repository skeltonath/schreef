var _       = require('lodash');
var request = require('request');
var format  = require('format');
var log4js  = require('log4js');

var LOG = log4js.getLogger('movie');

/**
 * This module takes a string and inserts into
 * a movie title and description.
 */
module.exports = {
  name: 'movie',
  command: ':movie',
  handler: movie
};

var randomImdbUrl = 'http://www.imdb.com/random/title';
var omdbApiUrl = 'http://www.omdbapi.com/?i=tt%s&type=movie&plot=short';

/**
 * Replaces words in a random popular IMBD title
 * with a given string and sends the results to
 * the IRC channel or user.
 */
function movie(client, nick, to, text, message, params) {
  LOG.info(format('Parameters: %s', params));
  getRandomImdbId(function(err, id) {
    if (!err) {
      request(format(omdbApiUrl, id), function(err, res, body) {
        if (!err && res.statusCode == 200) {
          var movie = JSON.parse(body);
          client.say(to, replaceRandomWords(movie.Title, params.join(' '), 1));
          client.say(to, replaceRandomWords(movie.Plot, params.join(' ')));
        } else {
          client.say(to, 'Error getting movie details');
        }
      });
    } else {
      client.say(to, 'Error getting random IMDB ID');
    }
  });
}

/**
 * Gets random popular IMDB ID.
 */
function getRandomImdbId(callback) {
  request(randomImdbUrl, function(err, res, body) {
    if (!err && res.statusCode == 200) {
      var id = res.request.uri.path.match(/\/title\/tt(\d+)\//)[1];
      callback && callback(null, id);
    } else {
      callback && callback(err);
    }
  });
}

function replaceRandomWords(str, replaceStr, numToReplace) {
  var strArray = str.split(' ');

  if (!numToReplace) {
    numToReplace = getRandomInt(1, strArray.length / 4);
  }

  if (strArray.length == 1) {
    strArray.push(replaceStr);
  } else {
    for (var i = 0; i < numToReplace; i++) {
      var index = getRandomInt(0, strArray.length);
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

// Returns a random integer between min (included) and max (excluded)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
