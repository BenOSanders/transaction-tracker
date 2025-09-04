const { db } = require('../config/db');

// DB prepared statements
const insertTx = db.prepare(`
  INSERT OR REPLACE INTO transactions (id, account_id, name, amount, date, category, category_confidence, user_category, payment_channel, merchent_name, merchent_entity_id, website, merchent_logo, address, city, state, zipcode)
  VALUES (@transaction_id, @account_id, @name, @amount, @date, @category, @category_confidence, @user_category, @payment_channel, @merchent_name, @merchent_entity_id, @website, @merchent_logo, @address, @city, @state, @zipcode)
`);

const getCursor = db.prepare("SELECT cursor FROM sync_state WHERE id = 1");
const setCursor = db.prepare("UPDATE sync_state SET cursor = ? WHERE id = 1");


/**
 * Receives list of transacitons to add to the databse. Returns number of transactions added
 * 
 * @param {JSON} transactions 
 * @returns {integer} Number of transactions added
 */
function saveTransactions(transactions) {
    let added = 0;

    transactions.data.forEach(tx => {
        insertTx.run({
            transaction_id: tx.transaction_id,
            account_id: tx.account_id,
            name: tx.name,
            amount: tx.amount,
            date: tx.date,
            category: tx.category, //potentially nested further
            category_confidence: tx.category_confidence,
            user_category: "",
            payment_channel: tx.payment_channel,
            merchent_name: tx.merchent_name,
            merchent_entity_id: tx.merchent_entity_id,
            website: tx.website,
            merchent_logo: tx.merchent_logo,
            address: tx.address,
            city: tx.city,
            state: tx.state,
            logo: tx.logo
        });
        added++;
    });

    console.log(`Successfully added ${added} transactions`)

    return added;
};

function removeTransactions() {

}

function updateTransactions() {
    
}

module.export = { saveTransactions, getCursor, setCursor };