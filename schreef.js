var _     = require('lodash');
var irc   = require('irc');
var path  = require('path');
var fs    = require('fs');

// IRC client config
var ircConfig = {
  server: 'grizzly.bearcopter.com',
  nick: 'Schreef',
  channels: ['#bots', "#chat"],
  debug: true,
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
    console.log('Loaded '+ handler.name);
  });
};

var handleMessage = function(nick, to, text, message) {
  var command = text.split(' ', 1)[0];
  var handler = handlerMap[command];

  if (_.has(handlerMap, command)) {
    handler(client, nick, to, text, message);
  }
};

// Load handlers, start client, add handlers
loadHandlers();
var client = new irc.Client(ircConfig.server, ircConfig.nick, ircConfig);
client.addListener('message', handleMessage);
