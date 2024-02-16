import { sql } from "@vercel/postgres";
import { NextApiResponse, NextApiRequest } from "next";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    await sql`DROP TABLE IF EXISTS AirdropListSeason1;`;
    return response.status(200).json({ result: "AirdropListSeason1 table dropped." });
  } catch (error) {
    return response.status(500).json({ error });
  }
}