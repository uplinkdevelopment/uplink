import { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const result =
      await sql`CREATE TABLE AirdropClaimSeason1 ( id SERIAL PRIMARY KEY, address varchar(255) UNIQUE, amount numeric, txId varchar(255), createdAt BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000 );`;
    return response.status(200).json({ result });
  } catch (error) {
    return response.status(500).json({ error });
  }
}
