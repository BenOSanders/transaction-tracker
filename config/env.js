//require("dotenv").config();
import dotenv from 'dotenv';

dotenv.config();

function required(name){
    if(!process.env[name]){
        throw new Error(`Missing environment variable: ${name}`);
    }
    return process.env[name];
}

export default {
    plaid: {
        PLAID_CLIENT_ID: required("PLAID_CLIENT_ID"),
        PLAID_SECRET: required("PLAID_SECRET"),
        PLAID_ENVIRONMENT: required("PLAID_ENVIRONMENT"),
        PLAID_ACCESS_TOKEN: required("PLAID_ACCESS_TOKEN"),
        PLAID_ACCOUNT_ID: required("PLAID_ACCOUNT_ID")
    },
    /*db: {
        DB_USERNAME: required("DB_USERNAME"),
        DB_PASSWORD: required("DB_PASSWORD")
    },*/
};

//module.export = env;