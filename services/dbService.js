import { db } from '../config/db.js';

/**
 * Cursor retrieval prepare statement
 */
const prepCursor = db.prepare(`SELECT cursor FROM sync_state WHERE account_id = @account_id`);

/**
 * Gets cursor before making request
 * 
 * @param {integer} account_id ID of account to retrieve cursor for
 */
export const getCursor = (account_id) => {
    return prepCursor.run({account_id});
};

/**
 * Update or insert cursor prepare statement
 */
const upsertCursor = db.prepare(`INSERT OR REPLACE INTO sync_state (account_id, cursor)
    VALUES (@account_id, @cursor)
    ON CONFLICT(account_id) DO UPDATE SET
        cursor = excluded.cursor
`);

/**
 * Sets cursor after retrieving data
 * 
 * @param {*} account_id ID of account to set cursor for
 */
export const setCursor = (account_id, cursor) => { 
    upsertCursor.run({account_id, cursor});
};


const insertAccount = db.prepare(`
    INSERT OR REPLACE INTO accounts (account_id)
    VALUES (@account_id)
`);

export const addAccount = (account_id) => {
    insertAccount.run({account_id});
};


const insertTx = db.prepare(`
  INSERT OR REPLACE INTO transactions (account_id, transaction_id, name, amount, date, category, category_confidence, user_category, payment_channel, merchent_name, merchent_entity_id, website, merchent_logo, address, city, state, zipcode)
  VALUES (@account_id, @transaction_id, @name, @amount, @date, @category, @category_confidence, @user_category, @payment_channel, @merchent_name, @merchent_entity_id, @website, @merchent_logo, @address, @city, @state, @zipcode)
`);

const removeTx = db.prepare(`DELETE FROM transactions WHERE transaction_id = @transaction_id`);

const upsertTx = db.prepare(`
    INSERT OR REPLACE INTO transactions (account_id, transaction_id, name, amount, date, category, category_confidence, user_category, payment_channel, merchent_name, merchent_entity_id, website, merchent_logo, address, city, state, zipcode)
    VALUES (@account_id, @transaction_id, @name, @amount, @date, @category, @category_confidence, @user_category, @payment_channel, @merchent_name, @merchent_entity_id, @website, @merchent_logo, @address, @city, @state, @zipcode)
    ON CONFLICT(transaction_id) DO UPDATE SET
        name = excluded.name,
        amount = excluded.amount,
        date = excluded.date,
        category = excluded.category,
        category_confidence = excluded.category_confidence,
        user_category = excluded.user_category,
        payment_channel = excluded.payment_channel,
        merchent_name = excluded.merchent_name,
        merchent_entity_id = excluded.merchent_entity_id,
        website = excluded.website,
        merchent_logo = excluded.merchent_logo,
        address = excluded.address,
        city = excluded.city,
        state = excluded.state,
        zipcode = excluded.zipcode
`);

/**
 * Prepare statemenet to upsert balance
 */
const upsertBalance = db.prepare(`
    INSERT OR REPLACE INTO balance (account_id, balance)
    VALUES (@account_id, @balance)
    ON CONFLICT(account_id) DO UPDATE SET
        balance = excluded.balance
    `);

/**
 * Receives list of transacitons to add to or modify in the databse. Returns number of transactions added or modified.
 * 
 * @param {JSON} transactions Transaction to be added or modified
 * @returns {integer} Number of transactions added
 */
export function saveTransactions(transactions) {
    let upserted = 0;

    if(Object.keys(transactions).length === 0) {
        return 0
    };

    transactions.forEach(tx => {
        upsertTx.run({
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

export function removeTransactions(transactions) {
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

export function updateBalance(account_id, balance) {
    if(balance == null) {
        console.log(`Failed to update account balance`);
        return 0;
    }
    upsertBalance.run({account_id, balance});

    console.log(`Successfully updated account balance`);
    
    return 0;
};