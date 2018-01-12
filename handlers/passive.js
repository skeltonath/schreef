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
  // Storing message contents, storing lowercase version for testing against
  let str = message.content;
  let strTest = _.toLower(str);

  // Regex functions that we'll use like a switch
  let dadTest = new RegExp("i'm| im ");
  let dadTest2 = new RegExp("i am");
  let shitTest = new RegExp("good shit");

  try {
    // matching messages with "i'm" or " im ", force toLower for check, add space at beginning
    //    to match incoming messages that start with "im ", but eliminating words that
    //    end with "im" to reduce false positives
    if(dadTest.test(' ' + strTest)){
      heyDad(channel, message, client, str, dadTest, 4);
    // matching messages that include "i am"
    } else if(dadTest2.test(strTest)){
      heyDad(channel, message, client, str, dadTest2, 5);
    // annoyingly, will run the normal goodshit command if your message contains "good shit"
    } else if(shitTest.test(strTest)){
      let gs = require('./goodshit');
      gs.handler(message.channel, message, str);
    }
  }
  catch(err) {
    // Error logging outside of main schreef.js function because we don't log every
    //     time the passive handler is used, which is every message that isn't
    //     an explicit command.
    LOG.error('Error when running a passive command: ');
    LOG.error(err);
  }
  
};

// "I'm hungry" "Hi Hungry, I'm Dad"
function heyDad(channel, message, client, str, dadTest, testLength) {
  let pos = str.search(dadTest);
  let end = pos + testLength;
  let newName = _.startCase(_.toLower(str.substr(end, str.length)));
  channel.send(`Hi ${newName}, I'm ${client.user.username}`);
}