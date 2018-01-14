const azure = require('azure-storage');
const log4js = require('log4js');

/**
 * This handler manages the global supply of $chreef $tock.
 * Each new user is given 1000 $$ once they join the channel.
 * Use this stock as you will.

 */

const TABLENAME = 'schreeftable';
const ENTGEN = azure.TableUtilities.entityGenerator;
const STARTINGSTOCK = 1000;

const LOG = log4js.getLogger('stock');

module.exports = {
  name: 'stock',
  command: 'stock',
  handler: stock,
};

function stock(channel, message, params) {
  // Ignore bots
  if (message.author.bot) return;

  // Initialize table service
  const tableSvc = azure.createTableService(process.env.AZURE_STORAGE_CONNECTION_STRING);
  const splitParams = params.split(' ');

  // Verify the Azure Storage Table exists and create if it doesn't
  tableSvc.createTableIfNotExists(TABLENAME, (error) => {
    if (!error) {
      // Table exists or created
    } else {
      LOG.error(error);
    }
  });

  // Verify all users have an account and create new ones for those that don't
  message.client.users.forEach((member) => {
    if (!member.bot) {
      getStock(tableSvc, member.username, (error, result) => {
        if (typeof result !== 'number') {
          LOG.info(`Setting up new $chreef $tock account for ${member.username}`);
          updateUser(tableSvc, member.username, STARTINGSTOCK);
        }
      });
    }
  });

  if (splitParams[0] === 'help') {
    message.author.send(`.stock [params] Command Usage:
                          reset - Resets you back to 1000$$.
                          balance [here] - Displays your balance. DM by default, to channel with "here".
                          allbalances [here] - Displays everyone's balance. DM by default, to channel with "here".
                          send [username] [amount] - sends user amount of $$.`);
  }

  // Reset command to go back to starting stock
  if (splitParams[0] === 'reset') {
    updateUser(tableSvc, message.author.username, STARTINGSTOCK);
    LOG.info(`${message.author.username} reset his $$ account to starting value:${STARTINGSTOCK}`);
  }

  // Get the stock for that user
  if (splitParams[0] === 'balance') {
    getStock(tableSvc, message.author.username, (error, result) => {
      const balanceString = `${message.author.username}'s balance is ${result}$$`;

      if (splitParams[1] === 'here' && channel !== null) {
        channel.send(balanceString);
      } else {
        message.author.send(balanceString);
      }
    });
  }

  // Show the stock for all users
  if (splitParams[0] === 'allbalances') {
    if (splitParams[1] === 'here') {
      showAllStock(tableSvc, channel);
    } else {
      showAllStock(tableSvc, message.author);
    }
  }

  // Send stock to another user if they have an account
  if (splitParams[0] === 'send') {
    const recipient = splitParams[1];
    const sendAmount = parseInt(splitParams[2], 10);

    if (sendAmount === 0) {
      channel.send('Why?');
    } else if (sendAmount < 0) {
      channel.send('You can\'t steal $$ here, fleshbag.');
    } else if (recipient !== message.author.username) {
      getStock(tableSvc, recipient, (recieverError, receiverStock) => {
        if (typeof receiverStock === 'number') {
          getStock(tableSvc, message.author.username, (senderError, senderStock) => {
            if ((senderStock - parseInt(sendAmount, 10)) > 0 && typeof senderStock === 'number') {
              const newSenderTotal = senderStock - parseInt(sendAmount, 10);
              const newReceiverTotal = receiverStock + parseInt(sendAmount, 10);
              let transactionString = 'Transaction Complete:\n';
              const transactionLog = `${message.author.username} sent ${recipient} ${sendAmount}$$`;

              updateUser(tableSvc, message.author.username, newSenderTotal);
              updateUser(tableSvc, recipient, newReceiverTotal);

              transactionString += `${message.author.username}: ${senderStock} - ${sendAmount} = ${newSenderTotal}\n${recipient}: ${receiverStock} + ${sendAmount} = ${newReceiverTotal}`;

              LOG.info(transactionLog);
              channel.send(transactionString);
            } else {
              channel.send('Not enough $$ to make the transaction. Get a job.');
              LOG.error(`${senderError}: Sender doesn't exist or doesn't have enough $$ to send`);
            }
          });
        } else {
          channel.send('Nobody of that name exists or they\'re a bot. Schreef won\'t throw his $$ to the abyss or filthy machines.');
          LOG.error(`${recieverError}: Recipient doesn't exist.`);
        }
      });
    } else {
      channel.send('You can\'t send yourself stock. Who do you think you are?');
    }
  }
}

// Used to update or create a user entry in the Azure Table
function updateUser(tableSvc, username, amount) {
  const userEntry = {
    PartitionKey: ENTGEN.String(username),
    RowKey: ENTGEN.String('1'),
    schreefstock: ENTGEN.Int32(amount),
  };

  tableSvc.insertOrReplaceEntity(TABLENAME, userEntry, null, (error) => {
    if (!error) {
      // Entity updated
    } else {
      LOG.error(error);
    }
  });
}

// Displays everyone's stock
function showAllStock(tableSvc, channel) {
  const query = new azure.TableQuery().where('RowKey eq ?', '1');
  let displayResult = 'Full ledger: ';

  tableSvc.queryEntities(TABLENAME, query, null, (error, result) => {
    if (!error) {
      // query successful
      result.entries.forEach((entry) => {
        const line = `${entry.PartitionKey._} has ${entry.schreefstock._}$$`;
        displayResult = `${displayResult}\n${line}`;
      });

      displayResult = `${displayResult}\nschreef has an infinite amount of stock`;

      channel.send(displayResult);
    } else {
      LOG.error(error);
    }
  });
}


// Gets the amount of stock the user has and makes it available in the callback
function getStock(tableSvc, username, callback) {
  const query = new azure.TableQuery().select(['schreefstock']).where('PartitionKey eq ?', username);

  tableSvc.queryEntities(TABLENAME, query, null, (error, result, response) => {
    if (!error) {
      // query successful
      if (result.entries.length > 0) {
        callback(error, parseInt(result.entries[0].schreefstock._, 10), response);
      } else {
        callback(error, null, response);
      }
    } else {
      LOG.error(error);
      callback(error, null, response);
    }
  });
}
