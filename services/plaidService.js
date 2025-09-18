import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import env from '../config/env.js';
import { getCursor, setCursor, addAccount, getAccessToken } from './dbService.js';

// Set up Plaid API configuration
const configuration = new Configuration({
	basePath: PlaidEnvironments[process.env.PLAID_ENVIRONMENT],

});

// Instantiate Plaid API client
const client = new PlaidApi(configuration);


/**
 * Must retrieve transactions and return them as json, and update cursor
 * 
 * @param {string} TODO: include access token as a passed in value to support multiple accounts.
 * @returns {array} array with three JSON objects: added, modified and removed. Returns empty array if no transactions were received.
 */
export async function getTransactions (item_id) {

	if(item_id == undefined || item_id == null) {
		console.log("getTransactions Error: item_id is undefined or null");
		return 0;
	};

	let hasMore = true;

	let added = [];
	let modified = [];
	let removed = [];

	let data;
	let account_id;
	let balance;
	let balanceJSON;

	const access_token = getAccessToken(item_id).access_token;
	// Get cursor from DB
	let current_cursor = getCursor(item_id).cursor;

	while(hasMore) {
		const request = {
			client_id: env.plaid.PLAID_CLIENT_ID, // Already exists in config
			secret: env.plaid.PLAID_SECRET, // Already exists in config
			access_token: access_token,
			cursor: current_cursor
		}		

		const response = await client.transactionsSync(request);
		data = response.data;

		// If 
		if(data.transactions_update_status == "HISTORICAL_UPDATE_COMPLETE") {
			console.log("Transactions up to date");
			current_cursor = data.next_cursor;
			//Ensure account exists
			//addAccount(account_id);
			// Save new cursor to DB
			setCursor(item_id, current_cursor);
			return [];
		} else if (data.transactions_update_status == "TRANSACTIONS_UPDATE_STATUS_UNKNOWN") {
			console.log("Transactions update status unknown");
			current_cursor = data.next_cursor;
			//Ensure account exists
			//addAccount(account_id);
			// Save new cursor to DB
			setCursor(item_id, current_cursor);
			return [];
		} else if (data.transactions_update_status == "INITIAL_UPDATE_COMPLETE") {
			console.log("Transactions initial update complete");
			current_cursor = data.next_cursor;
			//Ensure account exists
			//addAccount(account_id);
			// Save new cursor to DB
			setCursor(item_id, current_cursor);
			return [];
		} else {
			console.log("New transactions received");
			if(data.accounts.length != 0) {
				account_id = data.accounts[0].account_id;
				balance = data.accounts[0].balances.available;	
			};

			added = added.concat(data.added);
			modified = modified.concat(data.modified);
			removed = removed.concat(data.removed);
			balanceJSON = {account_id, balance};

			// TODO: Add in an update to "balance". Make sure balance has changed, so you don't repeat if not necessary. 
			current_cursor = data.next_cursor;
			hasMore = data.has_more;
		};
	}


	//Ensure account exists
	//addAccount(account_id);

	// Save new cursor to DB
	setCursor(item_id, current_cursor);

	return [added, modified, removed, balanceJSON];
};

