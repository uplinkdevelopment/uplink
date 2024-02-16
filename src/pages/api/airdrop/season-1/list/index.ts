import { sql } from "@vercel/postgres";
import { NextApiResponse, NextApiRequest } from "next";

interface DataItem {
  address: string;
  amount: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      try {
        const data = req.body as DataItem[];

        if (!data) throw new Error("AirdropList data is required");

        for (let i = 0; i < data.length; i++) {
          const address = data[i].address;
          const amount = data[i].amount;

          await sql`
          INSERT INTO AirdropListSeason1 (address, amount, isClaimed)
          VALUES (${address}, ${amount}, false)
          ON CONFLICT (address) DO NOTHING;
        `;
        }

        return res.status(200).json({
          code: 1001,
        });
      } catch (error) {
        return res.status(500).json({
          error: error,
        });
      }
    } else if (req.method === "GET") {
      try {
        const { rows, rowCount } = await sql`SELECT * FROM AirdropListSeason1;`;

        return res.status(200).json({
          code: 1001,
          data: { rows, rowCount },
        });
      } catch (error) {
        return res.status(500).json({
          error: error,
        });
      }
    } else {
      // Handle other HTTP methods (if needed)
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
}
