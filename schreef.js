const _ = require('lodash');
const Discord = require('discord.js');
const path = require('path');
const fs = require('fs');
const log4js = require('log4js');
const format = require('format');
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
log4js.configure('config/log4js-config.json');
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
  
  const handler = handlers.find(h => {
    const test = h.test;
    
    if (_.isString(test)) {
      return message.startsWith(test);
    }
    
    if (_.isFunction(test)) {
      return test(message);
    }
    
    return false;
  });
  
  if (handler) {
    LOG.info(`Executing ${handler.name} command`);
    handler.handler(message, client);
  }
  
  

  // handle command
  const args = message.content.match(/^\.(\w+)\s*(.*)$/);

  if (!_.isNull(args)) {
    const command = args[1];
    const params = args[2];

    if (_.has(handler, command)) {
      LOG.info(format('Executing %s command', command));
      const handler = handler[command];
      handler(message.channel, message, params);
    }
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
