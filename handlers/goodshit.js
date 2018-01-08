var _      = require('lodash');
var log4js = require('log4js');
var format = require('format');

var LOG = log4js.getLogger('goodshit');

module.exports = {
  name: 'goodshit',
  command: 'gs',
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
  'Good shit',
  '👌👀👌👀',
  '👀',
  '💯',
  '💯 💯',
  'good ✔',
  'right✔there',
  'right👌there',
  'mMMMMᎷМ',
  '🍕🍅🍕🍅 ',
  'sign me the fuck up',
  'oh👌fuck👌',
  'oh👌shit👌',
  'fuck👌yes👌',
  '(socrates died for real)'
  ];

function goodshit(channel, message, params) {
  LOG.info(params);
  var msg = params;
  var msgText = 'good shit good shit good shit';

  if (!_.isNull(msg)) {
    msgText = msg;
  }

  var words = _.words(msgText,  /[^, ]+/g);

  var newWords = [];
  _.each(words, function(word) {
    var goodshitBefore = _.random(0, 3);
    var goodshitAfter = _.random(0, 3);

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
  channel.send(newText.length > 2000 ? newText.substring(0, 2000) : newText);
}
