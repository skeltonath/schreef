const _ = require('lodash');
const rp = require('request-promise');
const cheerio = require('cheerio');
const format = require('format');
const log4js = require('log4js');

const LOG = log4js.getLogger('movie');

/**
 * This module takes a string and inserts into
 * a movie title and description.
 */
module.exports = {
  name: 'movie',
  trigger: '.movie',
  handler: movie,
};

const { OMDB_API_KEY } = process.env;
const IMDB_URL = 'http://www.imdb.com/chart/moviemeter';
const OMDB_URL = 'http://www.omdbapi.com';
const IMDB_ID_REGEX = /tt(\d+)/;

const NO_REPLACE_WORDS = [
  'a', 'an', 'the', 'some',
  'of', 'with', 'at', 'from',
  'into', 'during', 'including', 'until',
  'against', 'among', 'throughout', 'despite',
  'towards', 'upon', 'concerning', 'to',
  'in', 'for', 'on', 'by',
  'about', 'like', 'through', 'over',
  'before', 'between', 'after', 'since',
  'without', 'under', 'within', 'along',
  'following', 'across', 'behind', 'beyond',
  'plus', 'except', 'but', 'up',
  'out', 'around', 'down', 'off',
  'above', 'near', 'and', 'that',
  'or', 'as', 'if', 'when',
  'because', 'than', 'while', 'where',
  'after', 'so', 'though', 'since',
  'until', 'unless', 'although', 'whether',
  'nor', 'be', 'being', 'been',
  'is', 'are', 'am', 'was',
  'were',
];

const WORD_ENDINGS = [
  'ing', 'ed', 's',
];

let CACHED_IMDB_IDS = [];

/**
 * Replaces words in a random popular IMBD title
 * with a given string and sends the results to
 * the IRC channel or user.
 */
async function movie(message) {
  const params = message.content.slice('.movie'.length).trim();

  if (_.isEmpty(CACHED_IMDB_IDS)) {
    LOG.info('IMDB ID cache is empty, populating cache');
    CACHED_IMDB_IDS = await getImdbIds();
  }

  const id = _.sample(CACHED_IMDB_IDS);
  const options = {
    uri: OMDB_URL,
    qs: {
      i: `tt${id}`,
      type: 'movie',
      plot: 'short',
      apikey: OMDB_API_KEY,
    },
    json: true,
  };

  rp.get(options)
    .then((movieResponse) => {
      if (movieResponse.Error) {
        const errorMsg = format('Error getting move details from OMBD: %s', movieResponse.Error);
        message.channel.send(errorMsg);
        LOG.error(errorMsg);
        return;
      }

      message.channel.send(replaceRandomWords(movieResponse.Title, _.startCase(params), 1));
      message.channel.send(replaceRandomWords(movieResponse.Plot, params));
    })
    .catch((err) => {
      const errorMsg = format('Error getting move details from OMBD: %s', err);
      message.channel.send(errorMsg);
      LOG.error(errorMsg);
    });
}

/**
 * Gets a random IMDB ID.
 */
function getImdbIds() {
  const options = {
    url: IMDB_URL,
    transform: cheerio.load,
  };

  return new Promise((resolve, reject) => {
    rp.get(options)
      .then(($) => {
        const ids = $('.titleColumn')
          .find('a')
          .map((i, el) => {
            const href = $(el).attr('href');
            return IMDB_ID_REGEX.exec(href)[1];
          })
          .get();
        resolve(ids);
      })
      .catch((err) => {
        LOG.error(err);
        reject(err);
      });
  });
}

function replaceRandomWords(str, replaceStr, numToReplace) {
  const words = _.words(str);

  if (!numToReplace) {
    numToReplace = _.random(1, words.length / 5);
  }

  if (words.length === 1) {
    return _.replace(str, words[0], `${words[0]} ${replaceStr}`);
  }

  const replacedWordIndexes = [];

  for (let i = 0; i < numToReplace; i++) {
    const index = _.random(0, words.length - 1);
    const word = words[index];
    if (!replacedWordIndexes.includes(index + 1) &&
        !replacedWordIndexes.includes(index - 1) &&
        !replacedWordIndexes.includes(index) &&
        !NO_REPLACE_WORDS.includes(word.toLowerCase())) {
      let newWord = replaceStr;
      const wordEnding = WORD_ENDINGS.find(we => word.endsWith(we));

      if (wordEnding) {
        if (newWord.endsWith('e') && (wordEnding === 'ed' || wordEnding === 'ing')) {
          newWord = newWord.slice(0, -1);
        }
        newWord += wordEnding;
      }

      str = str.replace(new RegExp(`\\b${word}\\b`), newWord);
      replacedWordIndexes.push(index);
    } else {
      i--;
    }
  }

  return str;
}

