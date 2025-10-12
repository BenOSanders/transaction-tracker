// Retrieves data from Plaid API functions and loads it into database
import { getTransactions } from '../services/plaidService.js';
import { saveTransactions, removeTransactions, updateBalance, getAllItems, getCursor } from '../services/dbService.js';

export async function syncTransactions () {
    // TODO: find a way to note have to turn this into an array, but to iterate through a json object. The forEach of JSON objects??
    let items = [].concat(getAllItems());

    items.forEach(async item => {
        let newTx = await getTransactions(item.item_id);

        // TODO: add more logic to handle multiple accounts and remove some hardcoding for balance updating.
        if(newTx.length != 0) {
            console.log("Attempting to load transactions");
            if(newTx[0] && newTx[0].data && Object.keys(newTx[0].data).length != 0) {
                saveTransactions(newTx[0]);
            } else {
                console.log("No transactions to add");
            }
            if(newTx[1] && newTx[1].data && Object.keys(newTx[1].data).length != 0) {
                saveTransactions(newTx[1]);
            } else {
                console.log("No transactions to modify");
            }
            if(newTx[2] && newTx[2].data && Object.keys(newTx[2].data).length != 0) {
                removeTransactions(newTx[2]);
            } else {
                console.log("No transactions to remove");
            }
            if(newTx[3] && newTx[3].balanceJSON && Object.keys(newTx[3].balanceJSON).length != 0) {
                updateBalance(newTx[3].balanceJSON.account_id, newTx[3].balanceJSON.balance);    
            } else {
                console.log("No accounts to update");
            }
        };
    });
    
};

//module.exports = { syncTransactions };