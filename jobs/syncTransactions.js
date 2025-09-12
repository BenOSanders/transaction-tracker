// Retrieves data from Plaid API functions and loads it into database
import { getTransactions } from '../services/plaidService.js';
import { saveTransactions, removeTransactions, updateBalance } from '../services/dbService.js';

export async function syncTransactions () {
    let newTx = await getTransactions();
    saveTransactions(newTx[0]);
    saveTransactions(newTx[1]);
    removeTransactions(newTx[2]);
    updateBalance(newTx[3]);
};

//module.exports = { syncTransactions };