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

	// TO REMOVE
	let added = [];
	let modified = [];
	let removed = [];
	let balance = []
	// TO REMOVE

	let data;

	// Get access token from DB
	const access_token = getAccessToken(item_id).access_token;

	// Get cursor from DB
	let current_cursor = getCursor(item_id).cursor || null;
	if(current_cursor == null) {
		console.log("Log: Cursor is null.");
	}

	while(hasMore) {
		const request = {
			client_id: env.plaid.PLAID_CLIENT_ID, // Already exists in config
			secret: env.plaid.PLAID_SECRET, // Already exists in config
			access_token: access_token,
			cursor: current_cursor
		};

		const response = await client.transactionsSync(request);
		data = response.data;

		// four arrays: added, modified, removed and accounts
		added.push(...data.added);
		modified.push(...data.modified);
		removed.push(...data.removed);

		//available
		// loop accounts
		if(balance.length === 0 ){
			balance = data.accounts.map(a => ({
				account_id: a.account_id,
				current: a.balances.current,
				available: a.balances.available
			}));
		}

		// todo: store the request id


		current_cursor = data.next_cursor;
		hasMore = data.has_more;
	};


	//Ensure account exists
	//addAccount(account_id);

	// Save new cursor to DB
	setCursor(item_id, current_cursor);

	return {
		newTx: added, 
		modifiedTx: modified, 
		removedTx: removed, 
		balanceData: balance
	};
};

