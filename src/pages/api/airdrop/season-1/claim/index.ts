import { sql } from "@vercel/postgres";
import { NextApiResponse, NextApiRequest } from "next";

interface QueryParams {
  address: string;
  txId: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { address, txId } = req.body as unknown as QueryParams;

    let eligible = false;
    let isClaimed = true;
    let amount = 0;

    const { rows } =
      await sql`SELECT * FROM AirdropListSeason1 WHERE address = ${address};`;

    if (rows && rows.length > 0) {
      eligible = true;
      isClaimed = rows[0].isclaimed;
      amount = rows[0].amount;
    }

    if (!eligible || isClaimed) {
      await sql`
    INSERT INTO AirdropErrorSeason1 (address, amount, txid)
    VALUES (${address}, ${amount}, ${txId});
  `;

      return res.status(200).json({
        code: 1012,
        msg: `You already claimed your airdrop before.`,
      });
    }

    try {
      await sql`
    INSERT INTO AirdropClaimSeason1 (address, amount, txId)
    VALUES (${address}, ${amount}, ${txId});
  `;

      // update AirdropListSeason1
      await sql`
  UPDATE AirdropListSeason1 SET isClaimed = true WHERE address = ${address};`;

      return res.status(200).json({
        code: 1001,
        message: "success",
      });
    } catch (error) {
      return res.status(500).json({ error });
    }
  } else if (req.method === "GET") {
    try {
      const rows = await sql`SELECT * FROM AirdropClaimSeason1;`;
      return res.status(200).json({
        claims: rows.rows,
        totalClaimAddresses: rows.rowCount,
      });
    } catch (error) {
      return res.status(500).json({ error });
    }
  } else {
    // Handle other HTTP methods (if needed)
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
