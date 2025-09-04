// Retrieves data from Plaid API functions and loads it into database
const { getTransactions } = require('../services/plaidService');
const { saveTransactions, removeTransactions, modifyTransactions } = require('../services/dbService');

let syncTransactions = () => {
    let newTx = getTransactions();
    saveTransactions(newTx[0]);
    // modifyTransactions(newtx[1]);
    // removeTransactions(newTx[2]);
};

module.exports = { syncTransactions };