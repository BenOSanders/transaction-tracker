import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
const { env } = require('../config/env');
const { getCursor, setCursor } = require('../config/db');

// Set up Plaid API configuration
const configuration = new Configuration({
	basePath: PlaidEnvironments[process.env.PLAID_ENV],
	baseOptions: {
		headers: {
			'PLAID-CLIENT-ID': env.plaid.PLAID_CLIENT_ID,
			'PLAID-SECRET': env.plaid.PLAID_SECRET,
		}
	},
});

// Instantiate Plaid API client
const client = new PlaidApi(configuration);

// JSON object to be built with pages of 
let response;

// Get cursor from DB
let cursor = getCursor.run().cursor;

/**
 * Must retrieve transactions and return them as json, and update cursor
 * 
 * @returns {array} array with three JSON objects: added, modified and removed
 */
function getTransactions() {

	let hasMore = true;

	let added = [];
	let modified = [];
	let removed = [];

	while(hasMore) {
		const request = {
			//client_id: env.plaid.PLAID_CLIENT_ID, // Already exists in config
			//secret: env.plaid.PLAID_SECRET, // Already exists in config
			access_token: env.plaid.PLAID_ACCESS_TOKEN,
			cursor: cursor
		}

		const response = client.transactionsSync(request);
		const data = response.data;

		added = added.concat(data.added);
		modified = modified.concat(data.modified);
		removed = removed.concat(data.removed);

		// TODO: Add in an update to "balance". Make sure balance has changed, so you don't repeat if not necessary. 
		
		cursor = data.next_cursor;
		hasMore = data.has_more;
	}

	// Save new cursor to DB
	setCursor.run(cursor);

	return {added, modified, removed};
};

module.export = { getTransactions };