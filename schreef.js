const _ = require('lodash');
const Discord = require('discord.js');
const path = require('path');
const fs = require('fs');
const log4js = require('log4js');
const express = require('express');
const http = require('http');

// configure express
const app = express();
const port = process.env.PORT || 5000;
app.set('view engine', 'ejs');
app.use(express.static(`${__dirname}/public`));
app.get('/', (req, res) => res.render('index'));
app.listen(port);

// configure env
require('dotenv').config();

// Configure log4js
if (process.env.NODE_ENV === 'development') {
  log4js.configure('config/log4js-dev.json');
} else {
  log4js.configure('config/log4js-prod.json');
}
const LOG = log4js.getLogger('main');

// Fields
const handlers = [];

// Functions
function loadHandlers() {
  const handlerPath = path.join(__dirname, 'handlers');
  const files = _.filter(fs.readdirSync(handlerPath), fileName => _.endsWith(fileName, '.js'));

  _.each(files, (file) => {
    /* eslint-disable global-require, import/no-dynamic-require */
    const handler = require(`./handlers/${file}`);
    handlers.push(handler);
    LOG.info(`Loaded ${handler.name}`);
    /* eslint-enable global-require, import/no-dynamic-require */
  });
}

function handleMessage(message) {
  // if message is from bot, skip
  if (message.author.bot) return;

  const handler = handlers.find((h) => {
    const trigger = h.trigger;

    if (_.isString(trigger)) {
      return message.content.startsWith(trigger);
    }

    if (_.isFunction(trigger)) {
      return trigger(message);
    }

    return false;
  });

  if (handler) {
    LOG.info(`Executing ${handler.name} command`);
    handler.handler(message, client);
  }
}

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
