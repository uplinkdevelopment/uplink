import { sql } from "@vercel/postgres";
import { NextApiResponse, NextApiRequest } from "next";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    await sql`DELETE FROM AirdropClaimSeason1;`;
    return response.status(200).json({ result: "AirdropClaimSeason1 table emptied" });
  } catch (error) {
    return response.status(500).json({ error });
  }
}
