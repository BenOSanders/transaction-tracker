// Retrieves data from Plaid API functions and loads it into database
import { getTransactions } from '../services/plaidService.js';
import { saveTransactions, removeTransactions, updateBalance, getAllItems } from '../services/dbService.js';

export async function syncTransactions () {
    // TODO: find a way to note have to turn this into an array, but to iterate through a json object. The forEach of JSON objects??
    let items = [].concat(getAllItems());

    items.forEach(async item => {
        let newTx = await getTransactions(item.item_id);

        // TODO: add more logic to handle multiple accounts and remove some hardcoding for balance updating.
        if(newTx.length != 0) {
            saveTransactions(newTx[0]);
            saveTransactions(newTx[1]);
            removeTransactions(newTx[2]);
            updateBalance(newTx[3].account_id, newTx[3].balance);    
        };
    });
    
};

//module.exports = { syncTransactions };