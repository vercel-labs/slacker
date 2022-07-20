import type { NextApiRequest, NextApiResponse } from "next";
import { run } from "@/lib/run";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const response = await run();
  res.status(200).json(response);
}
