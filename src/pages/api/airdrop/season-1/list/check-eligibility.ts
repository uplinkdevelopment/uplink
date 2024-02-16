import { sql } from "@vercel/postgres";
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyMessage } from "@unisat/wallet-utils";

interface QueryParams {
  address: string;
  publicKey: string;
  signature: string;
  walletProvider?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { address, publicKey, signature, walletProvider } =
        req.body as unknown as QueryParams;
      const message = `Welcome to Uplink\n\nSign in with ${address.toLowerCase()}`;

      let signatureValid = false;

      if (walletProvider === "unisat") {
        signatureValid = verifyMessage(publicKey, message, signature);
      } else {
        signatureValid = true;
      }

      let eligible = false;
      let amount = 0;
      let isClaimed = false;

      if (signatureValid) {
        const { rows } =
          await sql`SELECT * FROM AirdropListSeason1 WHERE address = ${address};`;
        if (rows && rows.length > 0) {
          eligible = true;
          amount = rows[0].amount;
          isClaimed = rows[0].isclaimed;

          return res.status(200).json({
            code: 1001,
            data: {
              status: signatureValid && eligible && amount > 0 && !isClaimed,
              amount: amount,
              isClaimed: isClaimed,
              // ...(signatureValid && eligible && amount > 0 && !isClaimed
              //   ? { isClaimed: isClaimed }
              //   : {}),
            },
          });
        } else {
          return res.status(200).json({
            code: 1004,
            data: {
              status: signatureValid && eligible && amount > 0 && !isClaimed,
            },
          });
        }
      } else {
        return res.status(200).json({
          code: 1015,
          msg: "Invalid sign.",
        });
      }
    } catch (error) {
      return res.status(500).json({
        error: error,
      });
    }
  } else {
    res.status(405).json({ error: "failed to load data" });
  }
}
