const _       = require('lodash');
const Discord = require('discord.js');
const path    = require('path');
const fs      = require('fs');
const log4js  = require('log4js');
const format  = require('format');
const express = require('express');
const http    = require('http');

// configure express
const app = express();
const port = process.env.PORT || 5000;
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('index'));
app.listen(port);

// configure env
require('dotenv').config();

// Configure log4js
log4js.configure('config/log4js-config.json');
const LOG = log4js.getLogger('main');

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
client.login(process.env.DISCORD_API_KEY);

// ping server to keep it awake on heroku
setInterval(() => {
  http.get('http://schreef.herokuapp.com');
}, 90000);
