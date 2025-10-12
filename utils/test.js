import express from 'express';
import { syncTransactions } from './jobs/syncTransactions.js';

export const app = express();
app.use(express.json());


syncTransactions();

