import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";

interface QueryParams {
  address: string;
}

// const protocolWallet = "tb1phew3kpvkrdr84qcx78deh70yhnvjd9v9wd32mk556ex7lk537wuqmvf2wq"; // testnet
const protocolWallet = "bc1pszdwxmxzu4mw02z8gfvr5dytatspfe6e5l0uez4alyy9734z7wtswqemws";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { address } = req.body as unknown as QueryParams;

    let isClaimed = true;
    let amount = 0;
    const { rows } =
      await sql`SELECT * FROM AirdropListSeason1 WHERE address = ${address};`;
    if (rows && rows.length > 0) {
      amount = rows[0].amount;
      isClaimed = rows[0].isclaimed;
    }

    if (isClaimed) {
      return res.status(200).json({
        code: 1012,
        msg: `You already claimed your airdrop before.`,
      });
    }

    let { networkFee, txCost } = await getTxCostFee(2, 3, 4, 1, 546, "main");

    return res.status(200).json({
      code: 1001,
      data: {
        protocolWallet,
        cost: txCost,
        networkFee: networkFee,
      },
    });
  } else {
    res.status(405).json({ error: "failed to load data" });
  }
}

async function getTxCostFee(
  txCounts: number,
  inputsLength: number,
  outputsLength: number,
  inscribeNums: number,
  type = 546,
  network = "testnet"
) {
  let overheadVbytes = 10.5 * txCounts; // https://bitcoinops.org/en/tools/calc-size/
  let inputsVbytes = inputsLength * 57.5;
  let outputsVbytes = outputsLength * 43;
  // let fee = (await fetchChainFeeRate(network)).halfHourFee;
  let fee = 45;
  let total = Math.ceil((overheadVbytes + inputsVbytes + outputsVbytes) * fee);
  return {
    networkFee: fee,
    txCost: total + inscribeNums * type + inscribeNums * 43 * fee,
  };
}

const fetchChainFeeRate = async (network: string) => {
  const url =
    network === "main"
      ? "https://mempool.space/api/v1/fees/recommended"
      : "https://mempool.space/testnet/api/v1/fees/recommended";
  const resp = await fetch(url);
  const data = await resp.json();
  return data;
};
