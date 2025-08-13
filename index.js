require('dotenv').config();
const express = require('express');
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import dayjs from 'dayjs';
import {createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';

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

// Get transactions
async function getTransactions() {
	try {
		const startDate = daysjs().subtract(30, 'day').format('YYYY-MM-DD');
		const endDate = daysjs().format('YYYY-MM-DD');

		const response = await client.transactionsGet({
			access_token: ACCESS_TOKEN,
      			start_date: startDate,
      			end_date: endDate,
      			options: {
        			count: 100, // max per page
        			offset: 0,
		});

		const transactions = response.data.transactions;
		
		console.log(`Fetched ${transactions.length} transactions`);

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
		path: 'transactions.csv',
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
			{ id: '', title: 'Account ID' },
		],
	});

	await csvWriter.writeRecords(
		transactions.map(tx => ({
		transaction_id: tx.transaction_id,
		date: tx.date,
		datetime: tx.datetime,
		authorization_date: tx.date,
		name: tx.name,
		amount: tx.amount,
		category: tx.category?.join(', ') || '',
		account_id: tx.account_id,
		}))
	);

	console.log('Transactions saved to transactions.csv');
}

getTransactions();
