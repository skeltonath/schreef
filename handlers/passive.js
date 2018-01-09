const log4js  = require('log4js');
const LOG     = log4js.getLogger('passive');
const format  = require('format');
const _       = require('lodash');

module.exports = {
  name: 'passive',
  command: 'passive',
  handler: passive
};

// Having fun with messages without explicitly asking for them

function passive(channel, message, client) {
  // Storing message contents
  let str = message.content

  // Regex functions that we'll use like a switch
  let dadTest = new RegExp("i'm|I'm| im ");
  let dadTest2 = new RegExp("i am|I am");

  try {
    if(dadTest.test(_.toLower(' ' + str))){
      heyDad(channel, message, client, str, dadTest, 4);
    } else if(dadTest2.test(_.toLower(str))){
      heyDad(channel, message, client, str, dadTest2, 5);
    }
  }
  catch(err) {
    LOG.error('Hey, I ran into an error when running a passive command: ');
    LOG.error(err);
  }
  
};

// "I'm hungry" "Hi Hungry, I'm Dad"
function heyDad(channel, message, client, str, dadTest, testLength) {
  let pos = str.search(dadTest);
  let end = pos + testLength;
  let newName = _.startCase(_.toLower(str.substr(end, str.length)));
  str = str.split(" ");
  channel.send(format("Hi %s, I'm %s", newName, client.user.username));
}