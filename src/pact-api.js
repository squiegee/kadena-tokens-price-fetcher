const Pact = require("pact-lang-api");

const creationTime = () => Math.round(new Date().getTime() / 1000) - 10;
const GAS_PRICE = 0.00000001;

const getTokenToKadena = async (token, exchange, chainId) => {
  const network = `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/${chainId}/pact`;
  try {
    let data = await Pact.fetch.local(
      {
        pactCode: `
          (use ${exchange})
          (let*
            (
              (p (get-pair ${token} coin))
              (reserveA (reserve-for p ${token}))
              (reserveB (reserve-for p coin))
            )[reserveA reserveB])
           `,
        meta: Pact.lang.mkMeta(
          "account",
          chainId,
          GAS_PRICE,
          3000,
          creationTime(),
          600
        ),
      },
      network
    );
    if (data.result.status === "success") {
      const tokenReserve = getReserve(data.result.data[0]);
      const kadenaReserve = getReserve(data.result.data[1]);
      const ratio = kadenaReserve / tokenReserve;
      return ratio;
    } else {
      console.log(data.result);
    }
  } catch (e) {
    console.log("NULLY2");
    console.log(e);
  }
  return null;
};

const getReserve = (tokenData) => {
  return tokenData.decimal ? tokenData.decimal : tokenData;
};

module.exports = { getTokenToKadena };
