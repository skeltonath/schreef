const Roll = require('roll');

module.exports = {
  name: 'roll',
  trigger: '.roll',
  handler: roll,
};


// Takes some user input and rolls some dice.
// Uses node-roll: https://github.com/troygoode/node-roll
function roll(message) {
  const params = message.content.slice('.roll'.length).trim();
  const roller = new Roll();
  const valid = roller.validate(params);

  // node-roll has its own validation mechanism
  if (!valid) {
    message.channel.send(`"${params}" is not a valid input. For more information, see https://github.com/troygoode/node-roll`);
  } else {
    const result = roller.roll(params);

    // show the end result as well as the dice rolled
    message.channel.send(`**${message.author.username}** rolled: *${result.rolled}*. Result: **${result.result}**`);
  }
}
