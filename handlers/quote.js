/**
 * This handler is a simple collection of things that David actually says. 
 */

var endpoint = "https://sheetsu.com/apis/a16044c2";
var request = require('http-request');
var _ = require('lodash');


function _getBufferData(response) {
    return JSON.parse(response.buffer.toString());
}


// This could be cleaner: Look into promises. 
function quote(client, nick, to, text, message) {
  request.get(endpoint, function(err, response) {

    var data = _getBufferData(response),
        record = _.sample(data.result);

    client.say(to, record.source + ': ' + record.quote); 
  });
};

module.exports = {
  name: 'quotes',
  command: ':quote',
  handler: quote
};