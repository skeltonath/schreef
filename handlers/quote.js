var _       = require('lodash');
var request = require('request');
var log4js  = require('log4js');

var LOG = log4js.getLogger('quote');

// Constants
var ENDPOINT = "https://sheetsu.com/apis/a16044c2";
var LOAD_QUOTES_DELAY_MS = 300000;
var _this = this;

/**
 * This handler returns a random quote from the Sheetsu Quote DB.
 */
module.exports = {
  name: 'quote',
  command: ':quote',
  handler: quote
};

// Fields
_this.quotes = {};

function quote(client, nick, to, text, message) {
  if (_this.quotes) {
    var row = getRandomQuote(_this.quotes);
    client.say(to, row.source + ': ' + row.quote);
  } else {
    client.say(to, 'Error getting quote');
  }
}

/**
 * Returns quote with given ID
 *
 * @param {String} id
 */
function getQuoteById(id) {
  return _.findWhere(_this.quotes, { 'id': id });
}

/**
 * Returns all quotes with matching column value
 *
 * @param {String} value Value to match
 * @param {String} col Column to match on
 */
function getQuotesByCol(value, col) {
  var matchObj = {};
  matchObj[col] = value;
  return _.where(_this.quotes, matchObj);
}

/**
 * Returns a random quote
 */
function getRandomQuote() {
  return _.sample(_this.quotes);
}

/**
 * Loads table of quotes from Sheetsu API.
 */
function loadQuotes() {
  LOG.debug('Loading quotes');

  request(ENDPOINT, function(err, res, body) {
    if (!err && res.statusCode == 200) {
      LOG.debug('Loaded quotes');
      _this.quotes = JSON.parse(body).result;
    } else {
      LOG.error('Error loading quotes');
    }
  });
}

/**
 * Initialization
 */
loadQuotes();
setInterval(loadQuotes, LOAD_QUOTES_DELAY_MS);
