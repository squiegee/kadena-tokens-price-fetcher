require('dotenv').config()
const express = require('express');
const app = express();
const port = process.env.PORT;
const {getTokenPrices} = require('./src/db');


app.get('/getPrices', async (req, res) => {
    const {tokenAddress, fromTime, toTime} = req.query;
    const prices = await getTokenPrices(tokenAddress, fromTime, toTime);
    res.send(prices);
});

app.get('/isRunning', async (_req, res) => {
    res.send('running');
});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
});
