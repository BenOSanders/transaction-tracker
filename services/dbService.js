import { db } from '../config/db.js';

//======================================================================
//================================CURSOR================================
//======================================================================

/**
 * Cursor retrieval prepare statement
 */
const prepCursor = db.prepare(`SELECT cursor FROM sync_state WHERE item_id = @item_id`);

/**
 * Gets cursor before making request
 * 
 * @param {integer} account_id ID of account to retrieve cursor for
 */
export const getCursor = (item_id) => {
    return prepCursor.get({item_id});
};

/**
 * Update or insert cursor prepare statement
 */
const upsertCursor = db.prepare(`INSERT OR REPLACE INTO sync_state (item_id, cursor)
    VALUES (@item_id, @cursor)
`);

/**
 * Sets cursor after retrieving data
 * 
 * @param {*} item_id ID of item to set cursor for
 */
export const setCursor = (item_id, cursor) => { 
    if(cursor == getCursor(item_id, cursor)) {
        console.log("No cursor change.");
        return 0;
    }
    console.log("Updating cursor");
    upsertCursor.run({item_id, cursor});
};

//======================================================================
//================================Account===============================
//======================================================================

const insertAccount = db.prepare(`
    INSERT OR REPLACE INTO accounts (account_id)
    VALUES (@account_id)
`);

export const addAccount = (account_id) => {
    insertAccount.run({account_id});
};

//======================================================================
//==============================Transaction=============================
//======================================================================

const insertTx = db.prepare(`
  INSERT OR REPLACE INTO transactions (account_id, transaction_id, name, amount, date, category, category_confidence, user_category, payment_channel, merchant_name, merchant_entity_id, website, merchant_logo, address, city, state, zipcode)
  VALUES (@account_id, @transaction_id, @name, @amount, @date, @category, @category_confidence, @user_category, @payment_channel, @merchant_name, @merchant_entity_id, @website, @merchant_logo, @address, @city, @state, @zipcode)
`);

const removeTx = db.prepare(`DELETE FROM transactions WHERE transaction_id = @transaction_id`);

const upsertTx = db.prepare(`
    INSERT OR REPLACE INTO transactions (account_id, transaction_id, name, amount, date, category, category_confidence, user_category, payment_channel, merchant_name, merchant_entity_id, website, merchant_logo, address, city, state, zipcode)
    VALUES (@account_id, @transaction_id, @name, @amount, @date, @category, @category_confidence, @user_category, @payment_channel, @merchant_name, @merchant_entity_id, @website, @merchant_logo, @address, @city, @state, @zipcode)
    ON CONFLICT(transaction_id) DO UPDATE SET
        name = excluded.name,
        amount = excluded.amount,
        date = excluded.date,
        category = excluded.category,
        category_confidence = excluded.category_confidence,
        user_category = excluded.user_category,
        payment_channel = excluded.payment_channel,
        merchant_name = excluded.merchant_name,
        merchant_entity_id = excluded.merchant_entity_id,
        website = excluded.website,
        merchant_logo = excluded.merchant_logo,
        address = excluded.address,
        city = excluded.city,
        state = excluded.state,
        zipcode = excluded.zipcode
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
        console.log("Transactions empty.")
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
            merchant_name: tx.merchant_name,
            merchant_entity_id: tx.merchant_entity_id,
            website: tx.website,
            merchant_logo: tx.logo_url,
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


//======================================================================
//================================BALANCE===============================
//======================================================================

/**
 * Prepare statemenet to upsert balance
 */
const upsertBalance = db.prepare(`
    INSERT OR REPLACE INTO balance (account_id, balance)
    VALUES (@account_id, @balance)
    ON CONFLICT(account_id) DO UPDATE SET
        balance = excluded.balance
`);

export function updateBalance(account_id, balance) {
    if(balance == null) {
        console.log(`Failed to update account balance`);
        return 0;
    }
    upsertBalance.run({account_id, balance});

    console.log(`Successfully updated account balance`);
    
    return 0;
};


//======================================================================
//=================================ITEMS================================
//======================================================================

const selectAllItems = db.prepare(`SELECT * FROM items;`);

export function getAllItems() {
    return selectAllItems.get();
};

const insertItem = db.prepare(`
    INSERT INTO items (item_id, access_token, institution_name)
    VALUES (@item_id, @access_token, @institution_name);
`);


//======================================================================
//=================================MISC=================================
//======================================================================

const selectAccessToken = db.prepare(`
    SELECT access_token FROM items WHERE item_id = @item_id;
`);

export function getAccessToken(item_id) {
    return selectAccessToken.get({item_id});
};