// Retrieves data from Plaid API functions and loads it into database
import { getTransactions } from '../services/plaidService.js';
import { saveTransactions, removeTransactions, updateBalance, getAllItems, getCursor } from '../services/dbService.js';

export async function syncTransactions () {
    // TODO: find a way to note have to turn this into an array, but to iterate through a json object. The forEach of JSON objects??
    let items = [].concat(getAllItems());

    items.forEach(async item => {
        let transactions = await getTransactions(item.item_id);


        // TODO: add more logic to handle multiple accounts and remove some hardcoding for balance updating.
        if(transactions.length != 0) {
            console.log("Attempting to load transactions");

            saveTransactions(transactions.newTx);
            saveTransactions(transactions.modifiedTx);
            removeTransactions(transactions.removedTx);
            transactions.balanceData.forEach(a => {
                updateBalance(a.account_id, a.available);
            });

        };
    });
    
};

//module.exports = { syncTransactions };