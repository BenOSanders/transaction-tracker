const { db } = require('../config/db');

/**
 * Gets cursor before making request
 * 
 * @param {integer} account_id ID of account to retrieve cursor for
 */
let getCursor = (account_id) => { db.prepare(`SELECT cursor FROM sync_state WHERE account_id = ${account_id}`)};

/**
 * Sets cursor after retrieving data
 * 
 * @param {*} account_id ID of account to set cursor for
 */
let setCursor = (account_id) => { db.prepare(`UPDATE sync_state SET cursor = ? WHERE id = ${account_id}`)};

// Initial 
//const getCursor = db.prepare("SELECT cursor FROM sync_state WHERE id = 1");
//const setCursor = db.prepare("UPDATE sync_state SET cursor = ? WHERE id = 1");

// DB prepared statements
const insertTx = db.prepare(`
  INSERT OR REPLACE INTO transactions (account_id, transaction_id, name, amount, date, category, category_confidence, user_category, payment_channel, merchent_name, merchent_entity_id, website, merchent_logo, address, city, state, zipcode)
  VALUES (@account_id, @transaction_id, @name, @amount, @date, @category, @category_confidence, @user_category, @payment_channel, @merchent_name, @merchent_entity_id, @website, @merchent_logo, @address, @city, @state, @zipcode)
`);

const removeTx = db.prepare(`DELETE FROM transactions WHERE transaction_id = @transaction_id`);

const upsertTx = db.prepare(`
    INSERT OR REPLACE INTO transactions (account_id, transaction_id, name, amount, date, category, category_confidence, user_category, payment_channel, merchent_name, merchent_entity_id, website, merchent_logo, address, city, state, zipcode)
    VALUES (@account_id, @transaction_id, @name, @amount, @date, @category, @category_confidence, @user_category, @payment_channel, @merchent_name, @merchent_entity_id, @website, @merchent_logo, @address, @city, @state, @zipcode)
    ON CONFLICT(transaction_id) DO UPDATE SET
        account_id = excluded.account_id,
        transaction_id = exclude.transaction_id,
        name = exclude.name,
        amount = exclude.amount,
        date = exclude.date,
        category = exclude.category
        category_confidence = exclude.category_confidence,
        user_category = exclude.user_category,
        payment_channel = exclude.payment_channel,
        merchent_name = exclude.merchent_name,
        merchent_entity_id = exclude.merchent_entity_id,
        website = exclude.website,
        merchent_logo = exclude.merchent_logo,
        address = exclude.address,
        city = exclude.city,
        state = exclude.state,
        zipcode = exclude.zipcode
`);

/**
 * Receives list of transacitons to add to or modify in the databse. Returns number of transactions added or modified.
 * 
 * @param {JSON} transactions Transaction to be added or modified
 * @returns {integer} Number of transactions added
 */
function saveTransactions(transactions) {
    let upserted = 0;

    if(Object.keys(transactions).length === 0) {
        return 0
    };

    transactions.data.forEach(tx => {
        insertTx.run({
            account_id: tx.account_id,
            transaction_id: tx.transaction_id,
            name: tx.name,
            amount: tx.amount,
            date: tx.date,
            category: tx.personal_finance_category.primary,
            category_confidence: tx.personal_finance_category.confidence_level,
            user_category: "",
            payment_channel: tx.payment_channel,
            merchent_name: tx.merchent_name,
            merchent_entity_id: tx.merchent_entity_id,
            website: tx.website,
            merchent_logo: tx.logo_url,
            address: tx.location.address,
            city: tx.location.city,
            state: tx.location.state,
            zipcode: tx.location.postal_code
        });
        upserted++;
    });

    console.log(`Successfully upserted ${upserted} transactions`);

    return upserted;
};

function removeTransactions(transactions) {
    const deleted = 0;

    if(Object.keys(transactions).length === 0) {
        return 0
    };

    transactions.data.forEach(tx => {
        removeTx.run({
            transaction_id: tx.transaction_id
        });
        deleted++;
    });

    console.log(`Successfully deleted ${deleted} transactions`);

    return deleted;
}

module.export = { saveTransactions, removeTransactions, getCursor, setCursor };