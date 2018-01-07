const azure = require('azure-storage');

/**
 * This handler manages the global supply of $chreef $tock.
 * Each new user is given 1000 $$ once they join the channel.
 * Use this stock as you will.

 * Currently supports:
 * Checking balance
 */

const TABLENAME = 'schreeftable';
const ENTGEN = azure.TableUtilities.entityGenerator;
const STARTINGSTOCK = 1000;

module.exports = {
    name: 'stock',
    command: 'stock',
    handler: stock
};

function stock(channel, message, params) {

    // Wont work until this is populated from whatever is managing creds
    var placeholderConnectionString;

    // Initialize table service
    const tableSvc = azure.createTableService(placeholderConnectionString);
    var splitParams = params.split(" ");

    // Verify the Azure Storage Table exists and create if it doesn't
    tableSvc.createTableIfNotExists(TABLENAME, function (error, result, response) {
        if (!error) {
            // Table exists or created
        }
    })

    // Verify all users have an account and create new ones for those that don't
    for (let member of channel.guild.members.array()) {
        getStock(tableSvc, member.user.username, function (callback) {
            if (typeof callback != 'number') {
                console.log("initializing " + member.user.username);
                updateUser(tableSvc, member.user.username, STARTINGSTOCK);
            }
        })
    }

    if (splitParams[0] == "help") {
        channel.send("Command Usage:" + "\n" +
            ".reset - Resets you back to 1000$$" + "\n" +
            ".balance - Displays your balance" + "\n" +
            ".allbalances - Displays everyone's balance" + "\n" +
            ".send [username] [amount] - sends user amount of $$" + "\n");
    }

    // Reset command to go back to starting stock
    if (splitParams[0] == "reset") {
        updateUser(tableSvc, message.author.username, STARTINGSTOCK);
    }

    // Get the stock for that user
    if (splitParams[0] == "balance") {
        getStock(tableSvc, message.author.username, function (callback) {
            channel.send(message.author.username + "'s balance is " + callback + "$$");
        });
    }

    // Show the stock for all users
    if (splitParams[0] == "allbalances") {
        showAllStock(tableSvc, channel);
    }

    // Send stock to another user if they have an account
    if (splitParams[0] == "send") {
        var recipient = splitParams[1];
        var sendAmount = parseInt(splitParams[2]);

        console.log("Send recipient: " + recipient);
        console.log("Send amount: " + sendAmount);

        if (recipient != message.author.username) {
            getStock(tableSvc, recipient, function (receiverStock) {
                console.log(typeof receiverStock)
                if (typeof receiverStock == 'number') {
                    getStock(tableSvc, message.author.username, function (senderStock) {
                        if ((senderStock - sendAmount) > 0) {

                            var newSenderTotal = senderStock - sendAmount;
                            var newReceiverTotal = receiverStock + sendAmount;

                            console.log("Attempting to send " + sendAmount + " stock");

                            updateUser(tableSvc, message.author.username, newSenderTotal);
                            updateUser(tableSvc, recipient, newReceiverTotal);
                            channel.send("Transaction Complete:" + "\n" +
                                message.author.username + ': ' + senderStock + ' - ' + sendAmount + " = " + newSenderTotal + "\n" +
                                recipient + ': ' + receiverStock + ' + ' + sendAmount + " = " + newReceiverTotal);
                        }
                        else {
                            channel.send("Not enough stock to make the transaction.")
                        }
                    })
                }
                else {
                    channel.send("That user doesn't exist! Shcreef doesn't throw his stock to the abyss.")
                }
            })
        }
        else {
            channel.send("You can't send yourself stock here.");
        }
    }

};

// Used to update or create a user entry in the Azure Table
function updateUser(tableSvc, username, amount) {

    console.log("Updating user: " + username);

    var userEntry = {
        PartitionKey: ENTGEN.String(username),
        RowKey: ENTGEN.String('1'),
        schreefstock: ENTGEN.Int32(amount),
    }

    tableSvc.insertOrReplaceEntity(TABLENAME, userEntry, null, function (error, result, response) {
        if (!error) {
            // Entity updated
        }
    })
};

// Displays everyone's stock
function showAllStock(tableSvc, channel) {
    var query = new azure.TableQuery().where('RowKey eq ?', '1');
    var displayResult = 'Full ledger: ';

    tableSvc.queryEntities(TABLENAME, query, null, function (error, result, response) {
        if (!error) {
            // query successful
            for (var i = 0, len = result.entries.length; i < len; i++) {
                var line = result.entries[i].PartitionKey._ + ' has ' + result.entries[i].schreefstock._ + '$$';
                displayResult = displayResult + '\n' + line;
            }
            displayResult = displayResult + '\n' + "schreef has an infinite amount of stock";

            channel.send(displayResult);
        }
    })
};


// Gets the amount of stock the user has and makes it available in the callback
function getStock(tableSvc, username, callback) {

    console.log("in getstock");
    var query = new azure.TableQuery().select(['schreefstock']).where('PartitionKey eq ?', username);

    tableSvc.queryEntities(TABLENAME, query, null, function (error, result, response) {
        if (!error) {
            // query successful
            console.log("Query found result!");
            console.log("User: " + username);
            if (result.entries.length > 0) {
                console.log("Value: " + result.entries[0].schreefstock);
                callback(result.entries[0].schreefstock._);
            }
            else {
                callback(null);
            }
        }
        else {
            console.log('Error querying user ' + username);
            callback(null);
        }
    });
};