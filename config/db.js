import Database from 'better-sqlite3';

const db = Database('bank.db')

db.exec(`
CREATE TABLE IF NOT EXISTS transactions(
    account_id TEXT PRIMARY KEY,
    transactions_id TEXT,
    name TEXT,
    amount REAL,
    date DATE,
    category TEXT,
    category_confidence TEXT,
    user_category TEXT,
    payment_channel TEXT,
    merchent_name TEXT,
    merchent_entity_id TEXT,
    website TEXT,
    merchent_logo TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zipcode REAL,
);

CREATE TABLE IF NOT EXISTS sync_state(
    account_id INTEGER PRIMARY KEY CHECK (id = 1),
    cursor TEXT
);

CREATE TABLE IF NOT EXISTS balance(
    account_id INTEGER PRIMARY KEY CHECK (id = 1),
    balance REAL
);

`)


db.prepare("INSERT OR IGNORE INTO sync_state (id, cursor) VALUES (1, NULL)").run();

export default db;