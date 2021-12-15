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
    const query = `SELECT * FROM token_prices WHERE token_address = $1
    AND unix_time >= $2 AND unix_time <= $3;`
    const params = [ tokenAddress, fromTime,toTime];
    const results = await executeQuery(query, params);
    return results;
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

module.exports = {getTokenPrices}

