const { Pool } = require('pg');
let pool;
if (process.env.IS_DEV) {
    pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
    });
} else {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      });
}

const THIRTY_DAYS_SECONDS = 60*60*24*30;

async function getTokenPrices(tokenAddress, fromTime, toTime) {
    if (tokenAddress == null || tokenAddress === ''  ){
        return [];
    }
    const currTime = Math.floor(new Date().getTime() / 1000);
    fromTime = fromTime ?? currTime - THIRTY_DAYS_SECONDS;
    toTime = toTime ?? currTime;
    const params = [ tokenAddress, fromTime,toTime];
    const countQuery = `SELECT count(*) FROM token_prices WHERE token_address = $1
    AND unix_time >= $2 AND unix_time <= $3;`
    const counts = await executeQuery(countQuery, params);
    const selectWhere = `WHERE token_address = $1
    AND unix_time >= $2 AND unix_time <= $3` 
    let selectQuery = `SELECT * FROM token_prices ${selectWhere};`;
    // If we have too many results, lets reduce how many rows we return   
    if (counts[0].count >= 150) {
        const modulo = Math.ceil(counts[0].count / 100);
        selectQuery = `
            SELECT t.*
            FROM (
                SELECT *, row_number() OVER(ORDER BY unix_time ASC) AS row
                    FROM token_prices ${selectWhere}
                ) t
            WHERE t.row % ${modulo} = 0;
        `
    }
    const results = await executeQuery(selectQuery, params);
    return results;
}

async function insertTokenPrices(pricesData) {
    if (pricesData.length === 0 ){
        return;
    }
    await createTablesIfNotExists();
    const unixTime = Math.floor(new Date().getTime() / 1000);
    for (const data of pricesData) {
        const query = `INSERT INTO token_prices
        (unix_time,token_address,price_in_usd,price_in_kda)
        VALUES ($1,$2,$3,$4);`
        const params =[unixTime, data.tokenAddress, data.priceInUsd, data.priceInKda];
        await executeQuery(query, params);
    }
}

async function createTablesIfNotExists() {
    const query = `
    CREATE TABLE IF NOT EXISTS "token_prices" (
        "unix_time" BIGINT,
	    "token_address" VARCHAR(32) NOT NULL,
	    "price_in_usd" FLOAT,
        "price_in_kda" FLOAT
    );
    CREATE INDEX IF NOT EXISTS token_addresses ON token_prices (token_address);
    CREATE INDEX IF NOT EXISTS token_price_times ON token_prices (unix_time);
    `
    executeQuery(query);
}

async function executeQuery (query, params=[]) {
    try {
        const res = await pool.query(query, params);
        return res.rows;
    } catch (error) {
        console.error(error.stack);
        return [];
    }
};

module.exports = {getTokenPrices, insertTokenPrices}

