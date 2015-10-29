var _      = require('lodash');
var irc    = require('irc');
var path   = require('path');
var fs     = require('fs');
var log4js = require('log4js');
var util   = require('util');

// Configure log4js
log4js.configure('config/log4js-config.json');
var LOG = log4js.getLogger('main');

// IRC client config
var ircConfig = {
  server: 'grizzly.bearcopter.com',
  nick: 'Schreef',
  channels: ['#bots', "#chat"],
  debug: false,
  showErrors: true,
  floodProtection: true,
  floodProtectionDelay: 500
};

// handler map
var handlerMap = {};

var loadHandlers = function() {
  var handlerPath = path.join(__dirname, 'handlers');
  var files = _.filter(fs.readdirSync(handlerPath), function(fileName) {
    return _.endsWith(fileName, '.js');
  });

  _.each(files, function(file) {
    handler = require('./handlers/' + file);
    handlerMap[handler.command] = handler.handler;
    LOG.info('Loaded ' + handler.name);
  });
};

var handleMessage = function(nick, to, text, message) {
  var args = text.split(' ');
  var command = args.shift();

  if (_.has(handlerMap, command)) {
    var handler = handlerMap[command];
    handler(client, nick, to, text, message, args);
  }
};

// Load handlers, start client, add handlers
loadHandlers();
var client = new irc.Client(ircConfig.server, ircConfig.nick, ircConfig);
client.addListener('message', handleMessage);
