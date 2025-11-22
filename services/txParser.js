import { getTransactionsByDate } from "./dbService";

const period_encoding = {
    0: "jan-h1",
    1: "jan-h2",
    2: "feb-h1",
    3: "feb-h2",
    4: "mar-h1",
    5: "mar-h2",
    6: "apr-h1",
    7: "apr-h2",
    8: "may-h1",
    9: "may-h2",
    10: "jun-h1",
    11: "jun-h2",
    12: "jly-h1",
    13: "jly-h2",
    14: "aug-h1",
    15: "aug-h2",
    16: "sep-h1",
    17: "sep-h2",
    18: "oct-h1",
    19: "oct-h2",
    20: "nov-h1",
    21: "nov-h2",
    22: "dec-h1",
    23: "dec-h2"
}



// For a given item_id, loop through all transactions and place them in a "pay period"
// A pay period is the time between paychecks. Since paychecks do not arrive on the same day each month, 
// // dynamic pay periods must be set.
export const assignPayPeriods = (item_id) => {
    let transactions = getTransactionsByDate(item_id);

    let period = 0;
    let lastDate = null;
    let currentDate = null;

    

    // For each transaction,
    //      if the transaction in a paycheck from HP, it's a new pay period
    //      if the date 
    transactions.array.forEach(tx => {
        // if no pay period set
        // from the first transaction, set pay period to zero and 
        if(tx.category === "Income") {
            // start new pay period
            period++;

        }
    });
    return 0;
}

