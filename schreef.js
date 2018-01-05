const _       = require('lodash');
const Discord = require('discord.js');
const path    = require('path');
const fs      = require('fs');
const log4js  = require('log4js');
const format  = require('format');

// Configure log4js
log4js.configure('config/log4js-config.json');
const LOG = log4js.getLogger('main');

// Constants
const DISCORD_API_TOKEN = 'Mzk1NDcxNzk2NDQwMTM3NzI4.DSTXXw.QyrSqoLWEPWIVxpH1DWaalMRJYQ';

// Fields
const handlerMap = {};

// Functions
function loadHandlers() {
  const handlerPath = path.join(__dirname, 'handlers');
  const files = _.filter(fs.readdirSync(handlerPath), function(fileName) {
    return _.endsWith(fileName, '.js');
  });

  _.each(files, function(file) {
    handler = require('./handlers/' + file);
    handlerMap[handler.command] = handler.handler;
    LOG.info('Loaded ' + handler.name);
  });
};

function handleMessage(message) {
  // if message is from bot, skip
  if (message.author.id === client.user.id) return;

  // handle command
  var args = message.content.match(/^\.(\w+)\s*(.*)$/);

  if (!_.isNull(args)) {
    var command = args[1];
    var params = args[2];

    if (_.has(handlerMap, command)) {
      LOG.info(format('Executing %s command', command));
      var handler = handlerMap[command];
      handler(message.channel, message, params);
    }
  }
};

// Load handlers, start client, add handlers
loadHandlers();
const client = new Discord.Client();
client.on('ready', () => {
  LOG.info('schreef online!');
});

client.on('message', handleMessage);
client.login(DISCORD_API_TOKEN);
