import dotenv from 'dotenv';
import express from 'express';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import dayjs from 'dayjs';
import {createObjectCsvWriter } from 'csv-writer';

dotenv.config();
const app = express();
app.use(express.json());

const configuration = new Configuration({
	basePath: PlaidEnvironments[process.env.PLAID_ENV],
	baseOptions: {
		headers: {
			'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
			'PLAID-SECRET': process.env.PLAID_SECRET,
		}
	},
});

const client = new PlaidApi(configuration);

const access_token = process.env.PLAID_ACCESS_TOKEN;

// Get transactions for the last 30 days
async function getTransactions() {
	try {
		const startDate = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
		const endDate = dayjs().format('YYYY-MM-DD');

		const response = await client.transactionsGet({
			access_token: access_token,
			start_date: startDate,
			end_date: endDate,
			options: {
				count: 100, // max per page
				offset: 0,
			},
		});

		const transactions = response.data.transactions;
		
		console.log(`Fetched ${transactions.length} transactions`);

		// Move outside function
		await saveToCSV(transactions);

	} catch (error) {
		console.error('Error fetching transactions:', error.response?.data || error.message);
	}
}

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
			{ id: 'datetime', title: 'Datetime' },
			{ id: 'authorization_date', title: 'Authorization Date' },
			{ id: 'authorization_datetime', title: 'Authorization Datetime' },
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
		datetime: tx.datetime,
		authorization_date: tx.authorization_date,
		authorization_datetime: tx.authorization_datetime,
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


getTransactions();