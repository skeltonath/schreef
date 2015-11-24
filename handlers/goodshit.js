var _      = require('lodash');
var log4js = require('log4js');
var format = require('format');

var LOG = log4js.getLogger('goodshit');

module.exports = {
  name: 'goodshit',
  command: ':gs',
  handler: goodshit
};

var GOOD_SHIT_ARRAY = [
  'good shit',
  '(chorus: ʳᶦᵍʰᵗ ᵗʰᵉʳᵉ)',
  'go౦ԁ sHit',
  'НO0ОଠＯOOＯOОଠଠOoooᵒᵒᵒᵒᵒᵒᵒᵒᵒ',
  '👌',
  '✔',
  'if i do ƽaү so my self',
  'Good shit'
];

function goodshit(client, nick, to, text, message, params, buffer) {
  var msg = _.sample(buffer);
  var msgText = 'good shit good shit good shit';

  if (!_.isNull(msg)) {
    msgText = msg.text;
  }

  var words = _.words(msgText,  /[^, ]+/g);

  var newWords = [];
  _.each(words, function(word) {
    var goodshitBefore = _.random(0, 5);
    var goodshitAfter = _.random(0, 5);

    _.each(_.range(goodshitBefore), function() {
      var goodshitText = _.sample(GOOD_SHIT_ARRAY);
      newWords.push(goodshitText);
    });

    newWords.push(word);
    newWords.push('👌');

    _.each(_.range(goodshitAfter), function() {
      var goodshitText = _.sample(GOOD_SHIT_ARRAY);
      newWords.push(goodshitText);
    });
  });

  var newText = newWords.join(' ');
  client.say(to, newText);
}
