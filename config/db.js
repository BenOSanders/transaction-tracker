import Database from 'better-sqlite3';

export const db = Database('bank.db');

db.exec(`
CREATE TABLE IF NOT EXISTS transactions(
    account_id TEXT,
    transaction_id TEXT PRIMARY KEY,
    name TEXT,
    amount REAL,
    date DATE,
    category TEXT,
    category_confidence TEXT,
    user_category TEXT,
    payment_channel TEXT,
    merchant_name TEXT,
    merchant_entity_id TEXT,
    website TEXT,
    merchant_logo TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zipcode TEXT,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

CREATE TABLE IF NOT EXISTS sync_state(
    account_id TEXT PRIMARY KEY,
    cursor TEXT,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

CREATE TABLE IF NOT EXISTS balance(
    account_id TEXT PRIMARY KEY,
    balance REAL,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

CREATE TABLE IF NOT EXISTS accounts(
    account_id TEXT PRIMARY KEY,
    name TEXT,
    access_token TEXT
);

`);


//db.prepare("INSERT OR IGNORE INTO sync_state (account_id, cursor) VALUES (NULL, NULL)").run();

