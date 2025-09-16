// Retrieves data from Plaid API functions and loads it into database
import { getTransactions } from '../services/plaidService.js';
import { saveTransactions, removeTransactions, updateBalance, getAllItems } from '../services/dbService.js';

export async function syncTransactions () {
    let items = getAllItems();

    items.forEach(async item => {
        let newTx = await getTransactions(item.item_id);

        if(newTx.length != 0) {
            saveTransactions(newTx[0]);
            saveTransactions(newTx[1]);
            removeTransactions(newTx[2]);
            updateBalance(newTx[3].account_id, newTx[3].balance);    
        };
    });
    
};

//module.exports = { syncTransactions };