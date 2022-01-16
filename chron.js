require("dotenv").config();
const { fetchAllPrices } = require("./src/price-fetcher");
const { insertTokenPrices } = require("./src/db");
(async () => {
  pricesData = await fetchAllPrices();
  console.log(pricesData);
  await insertTokenPrices(pricesData);
})();
