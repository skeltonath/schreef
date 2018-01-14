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
  trigger: '.stock',
  handler: stock,
};

function stock(message) {
  // Initialize table service
  const tableSvc = azure.createTableService(process.env.AZURE_STORAGE_CONNECTION_STRING);
  const params = message.content.slice('.stock'.length).trim();
  const splitParams = params.split(' ');

  // Verify the Azure Storage Table exists and create if it doesn't
  tableSvc.createTableIfNotExists(TABLENAME, (error, result, response) => {
    if (!error) {
      // Table exists or created
    } else {
      LOG.error(error);
    }
  });

  // Verify all users have an account and create new ones for those that don't
  message.channel.guild.members.forEach((member) => {
    getStock(tableSvc, member.user.username, (error, result, response) => {
      if (typeof result !== 'number') {
        LOG.info(`Setting up new $chreef $tock account for ${member.user.username}`);
        updateUser(tableSvc, member.user.username, STARTINGSTOCK);
      }
    });
  });

  if (splitParams[0] === 'help') {
    message.channel.send('Command Usage:' + '\n' +
            '.reset - Resets you back to 1000$$' + '\n' +
            '.balance - Displays your balance' + '\n' +
            '.allbalances - Displays everyone\'s balance' + '\n' +
            '.send [username] [amount] - sends user amount of $$' + '\n');
  }

  // Reset command to go back to starting stock
  if (splitParams[0] === 'reset') {
    updateUser(tableSvc, message.author.username, STARTINGSTOCK);
    LOG.info(`${message.author.username} reset his $$ account to starting value:${STARTINGSTOCK}`);
  }

  // Get the stock for that user
  if (splitParams[0] === 'balance') {
    getStock(tableSvc, message.author.username, (error, result, response) => {
      message.channel.send(`${message.author.username}\'s balance is ${result}$$`);
    });
  }

  // Show the stock for all users
  if (splitParams[0] === 'allbalances') {
    showAllStock(tableSvc, message);
  }

  // Send stock to another user if they have an account
  if (splitParams[0] === 'send') {
    const recipient = splitParams[1];
    const sendAmount = parseInt(splitParams[2]);

    if (recipient !== message.author.username) {
      getStock(tableSvc, recipient, (error, receiverStock, response) => {
        if (typeof receiverStock === 'number') {
          getStock(tableSvc, message.author.username, (error, senderStock, response) => {
            if ((senderStock - sendAmount) > 0 && typeof senderStock === 'number') {
              const newSenderTotal = senderStock - sendAmount;
              const newReceiverTotal = receiverStock + sendAmount;
              let transactionString = 'Transaction Complete:' + '\n';
              const transactionLog = `${message.author.username} sent ${recipient} ${sendAmount}$$`;

              updateUser(tableSvc, message.author.username, newSenderTotal);
              updateUser(tableSvc, recipient, newReceiverTotal);

              transactionString += `${message.author.username}: ${senderStock} - ${sendAmount} = ${newSenderTotal}\n${recipient}: ${receiverStock} + ${sendAmount} = ${newReceiverTotal}`;

              LOG.info(transactionLog);
              message.channel.send(transactionString);
            } else {
              message.channel.send('Not enough stock to make the transaction.');
            }
          });
        } else {
          message.channel.send('That user does not exist! Schreef won\'t throw his stock to the abyss.');
        }
      });
    } else {
      message.channel.send('You can\'t send yourself stock here.');
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

  tableSvc.insertOrReplaceEntity(TABLENAME, userEntry, null, (error, result, response) => {
    if (!error) {
      // Entity updated
    } else {
      LOG.error(error);
    }
  });
}

// Displays everyone's stock
function showAllStock(tableSvc, message) {
  const query = new azure.TableQuery().where('RowKey eq ?', '1');
  let displayResult = 'Full ledger: ';

  tableSvc.queryEntities(TABLENAME, query, null, (error, result, response) => {
    if (!error) {
      // query successful
      result.entries.forEach((entry) => {
        const line = `${entry.PartitionKey._} has ${entry.schreefstock._}$$`;
        displayResult = `${displayResult}\n${line}`;
      });

      displayResult = `${displayResult}\nschreef has an infinite amount of stock`;

      message.channel.send(displayResult);
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
        callback(error, result.entries[0].schreefstock._, response);
      } else {
        callback(error, null, response);
      }
    } else {
      LOG.error(error);
      callback(error, null, response);
    }
  });
}
