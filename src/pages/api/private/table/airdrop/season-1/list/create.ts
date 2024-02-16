import { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const result =
      await sql`CREATE TABLE AirdropListSeason1 ( id SERIAL PRIMARY KEY, address varchar(255) UNIQUE, amount numeric, isClaimed boolean );`;
    return response.status(200).json({ result });
  } catch (error) {
    return response.status(500).json({ error });
  }
}
