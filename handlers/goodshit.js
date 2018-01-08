let _      = require('lodash');
let log4js = require('log4js');
let format = require('format');

let LOG = log4js.getLogger('goodshit');

module.exports = {
  name: 'goodshit',
  command: 'gs',
  handler: goodshit
};

let GOOD_SHIT_ARRAY = [
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
  let msg = params;
  let msgText = 'good shit good shit good shit';

  if (!_.isNull(msg)) {
    msgText = msg;
  }

  let words = _.words(msgText,  /[^, ]+/g);

  let newWords = [];
  _.each(words, function(word) {
    let goodshitBefore = _.random(0, 3);
    let goodshitAfter = _.random(0, 3);

    _.each(_.range(goodshitBefore), function() {
      let goodshitText = _.sample(GOOD_SHIT_ARRAY);
      newWords.push(goodshitText);
    });

    newWords.push(word);
    newWords.push('👌');

    _.each(_.range(goodshitAfter), function() {
      let goodshitText = _.sample(GOOD_SHIT_ARRAY);
      newWords.push(goodshitText);
    });
  });

  let newText = newWords.join(' ');
  channel.send(newText.length > 2000 ? newText.substring(0, 2000) : newText);
}
