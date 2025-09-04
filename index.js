import express from 'express';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import {createObjectCsvWriter } from 'csv-writer';


const app = express();
app.use(express.json());


const cursor = 0; //get from DB

// Get transactions for the last 30 days
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
}

// Soon to remove
async function saveToCSV(transactions) {
	/*
		Fields to pull from API response:
			transaction id, amount, personal finance category (primary, details, confidence)
			payment channel, authorization date, date, datetime, authorization datetime, name
			merchent name, merchent entity id, website.
	*/
	const csvWriter = createObjectCsvWriter({
		path: process.env.CSV_PATH,
		header: [
			{ id: 'transaction_id', title: 'Transaction ID' },
			{ id: 'date', title: 'Date' },
			{ id: 'name', title: 'Name' },
			{ id: 'amount', title: 'Amount' },
			{ id: 'merchent_name', title: 'Merchent Name' },
			{ id: 'merchent_entity_id', title: 'Merchent Entity ID' },
			{ id: 'website', title: 'Website' },
			{ id: 'payment_channel', title: 'Payment Channel' },
			{ id: 'category', title: 'Category' },
			{ id: 'category_confidence', title: 'Category Confidence' },
			{ id: 'account_id', title: 'Account ID' },
		],
	});

	await csvWriter.writeRecords(
		transactions.map(tx => ({
		transaction_id: tx.transaction_id,
		date: tx.date,
		name: tx.name,
		amount: tx.amount,
		merchent_name: tx.merchent_name,
		merchent_entity_id: tx.merchent_entity_id,
		website: tx.website,
		category: tx.category,
		category_confidence: tx.category_confidence,
		account_id: tx.account_id,
		}))
	);

	console.log(`Transactions saved to ${process.env.CSV_PATH}`);
}

