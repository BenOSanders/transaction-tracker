import express from 'express';
import { syncTransactions } from './jobs/syncTransactions';

const app = express();
app.use(express.json());


const cursor = 0; //get from DB

// Get transactions for the last 30 days
/*
async function getTransactions() {
	try {
		// Migrate to /transactions/sync
		// https://github.com/plaid/pattern/blob/master/server/update_transactions.js
		const response = await client.transactionsSync({
			client_id: process.env.PLAID_CLIENT_ID,
			secret: process.env.PLAID_SECRET,
			access_token: process.env.PLAID_ACCESS_TOKEN,
			cursor: process.env.CURSOR, //get from DB
			count: 500,
		});

		const transactions = response.data.transactions;
		
		// TODO: Save new cursor
		
		console.log(`Fetched ${transactions.length} transactions`);

		// Move outside function
		await saveToCSV(transactions);

		return transactions;
	} catch (error) {
		console.error('Error fetching transactions:', error.response?.data || error.message);
	}
}*/

syncTransactions();