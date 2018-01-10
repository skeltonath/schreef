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

const NO_REPLACE_WORDS = [
  'a',        'an',     'the',        'some',
  'of',       'with',   'at',         'from',
  'into',     'during', 'including',  'until',
  'against',  'among',  'throughout', 'despite',
  'towards',  'upon',   'concerning', 'to',
  'in',       'for',    'on',         'by',
  'about',    'like',   'through',    'over',
  'before',   'between','after',      'since',
  'without',  'under',  'within',     'along',
  'following','across', 'behind',     'beyond',
  'plus',     'except', 'but',        'up',
  'out',      'around', 'down',       'off',
  'above',    'near',   'and',        'that',
  'or',       'as',     'if',         'when',
  'because',  'than',   'while',      'where',
  'after',    'so',     'though',     'since',
  'until',    'unless', 'although',   'whether',
  'nor',      'be',     'being',      'been',
  'is',       'are',    'am',         'was',
  'were'
];

const WORD_ENDINGS = [
  'ing', 'ed', 's'
];

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

      channel.send(replaceRandomWords(movie.Title, _.startCase(_.toLower(params)), 1));
      channel.send(replaceRandomWords(movie.Plot, params));
    })
    .catch(err => {
      let errorMsg = format('Error getting move details from OMBD: %s', err);
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
  let words = _.words(str);

  if (!numToReplace) {
    numToReplace = _.random(1, words.length / 5);
  }

  if (words.length === 1) {
    return _.replace(str, words[0], `${words[0]} ${replaceStr}`);
  }

  let replacedWordIndexes = [];

  for (let i = 0; i < numToReplace; i++) {
    let index = _.random(0, words.length - 1);
    let word = words[index];
    if (!replacedWordIndexes.includes(index + 1) &&
        !replacedWordIndexes.includes(index - 1) &&
        !replacedWordIndexes.includes(index) &&
        !NO_REPLACE_WORDS.includes(word.toLowerCase())) {

      let newWord = replaceStr;
      let wordEnding = WORD_ENDINGS.find(wordEnding => word.endsWith(wordEnding));

      if (wordEnding) {
        if (newWord.endsWith('e') && (wordEnding === 'ed' || wordEnding === 'ing')) {
          newWord = newWord.slice(0, -1);
        }
        newWord = newWord + wordEnding;
      }

      str = str.replace(new RegExp(`\\b${word}\\b`), newWord);
      replacedWordIndexes.push(index);
    } else {
      i--;
    }
  }

  return str;
}

