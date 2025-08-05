require('dotenv').config();
const express = require('express');
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

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

// todo: store, encrypted, in database
let access_token = null;

// Create link token - manual for now
// Using hosted link in the future

// Get transactions


