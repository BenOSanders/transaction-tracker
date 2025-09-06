import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import env from '../config/env.js';
import { getCursor, setCursor } from './dbService.js';

// Set up Plaid API configuration
const configuration = new Configuration({
	basePath: PlaidEnvironments[process.env.PLAID_ENVIRONMENT],

});

// Instantiate Plaid API client
const client = new PlaidApi(configuration);

// JSON object to be built with pages of 
let response;

// Get cursor from DB
let current_cursor = getCursor(env.plaid.PLAID_ACCOUNT_ID);
if(current_cursor != null) {current_cursor = null};

/**
 * Must retrieve transactions and return them as json, and update cursor
 * 
 * @returns {array} array with three JSON objects: added, modified and removed
 */
export async function getTransactions () {

	let hasMore = true;

	let added = [];
	let modified = [];
	let removed = [];

	let data;

	while(hasMore) {
		const request = {
			client_id: env.plaid.PLAID_CLIENT_ID, // Already exists in config
			secret: env.plaid.PLAID_SECRET, // Already exists in config
			access_token: env.plaid.PLAID_ACCESS_TOKEN,
			cursor: current_cursor
		}

		const response = await client.transactionsSync(request);
		data = response.data;

		added = added.concat(data.added);
		modified = modified.concat(data.modified);
		removed = removed.concat(data.removed);

		// TODO: Add in an update to "balance". Make sure balance has changed, so you don't repeat if not necessary. 
		
		current_cursor = data.next_cursor;
		hasMore = data.has_more;
	}

	// Save new cursor to DB
	setCursor(data.accounts[0].account_id, current_cursor);

	return [added, modified, removed];
};

//module.export = { getTransactions };