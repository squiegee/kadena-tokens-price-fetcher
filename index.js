require('dotenv').config()
const express = require('express');
const app = express();
const port = process.env.APP_PORT;
const {getTokenPrices} = require('./src/db');


app.get('/', async (req, res) => {
    const {tokenAddress, fromTime, toTime} = req.query;
    const prices = await getTokenPrices(tokenAddress, fromTime, toTime);
    res.send(prices);
});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
});
