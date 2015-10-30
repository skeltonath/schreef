var _      = require('lodash');
var irc    = require('irc');
var path   = require('path');
var fs     = require('fs');
var log4js = require('log4js');
var format = require('format');

// Configure log4js
log4js.configure('config/log4js-config.json');
var LOG = log4js.getLogger('main');
LOG.setLevel('info');

// Constants
var SERVER = 'grizzly.bearcopter.com';
var NICK = 'Schreef';
var CHANS = ['#bots', '#chat'];
var MAX_BUFF_SIZE = 500;
var COMMAND_CHAR = ':';


// Fields
var handlerMap = {};
var messageBuffers = {};
var ircConfig = {
  server: SERVER,
  nick: NICK,
  channels: CHANS,
  debug: false,
  showErrors: true,
  floodProtection: true,
  floodProtectionDelay: 500
};

// Functions
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
  // if message is from bot, skip
  if (nick === NICK) return;

  var buffer = _.get(messageBuffers, to, []);

  // if message is not a command, save it to buffer
  if (text.charAt(0) !== COMMAND_CHAR) {
    var message = {
      nick: nick,
      text: text,
      timestamp: _.now()
    };

    var newLen = buffer.unshift(message);
    if (newLen > MAX_BUFF_SIZE) {
      buffer.pop();
    }

    messageBuffers[to] = buffer;
    LOG.debug(format('Added message ({timestamp: %s, nick: %s, text: %s) to %s buffer',
      message.timestamp, message.nick, message.text, to));

    return;
  }

  // handle command
  var args = text.split(' ');
  var command = args.shift();

  if (_.has(handlerMap, command)) {
    var handler = handlerMap[command];
    handler(client, nick, to, text, message, args, buffer);
  }
};

// Load handlers, start client, add handlers
loadHandlers();
var client = new irc.Client(ircConfig.server, ircConfig.nick, ircConfig);
client.addListener('message', handleMessage);
