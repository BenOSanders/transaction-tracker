import app from test.js;

app.post("/transactions-available", (req, res) => {

    console.log(res);

    res.send("All Good");
});