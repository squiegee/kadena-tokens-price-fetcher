require('dotenv').config()
const express = require('express');
const cors = require('cors');
const {getTokenPrices} = require('./src/db');

const app = express();

app.use(cors());
app.options('*', cors());

app.get('/getPrices', async (req, res) => {
    const {tokenAddress, fromTime, toTime} = req.query;
    const prices = await getTokenPrices(tokenAddress, fromTime, toTime);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(prices);
});

app.get('/isRunning', async (_req, res) => {
    res.send('running');
});

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
});
