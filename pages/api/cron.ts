import type { NextApiRequest, NextApiResponse } from "next";
import { cron } from "@/lib/cron";
import { verifySignature } from "@upstash/qstash/nextjs";


async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await cron();
    console.log(response)
    res.status(200)

  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err });
  }
}

/**
 * verifySignature will try to load `QSTASH_CURRENT_SIGNING_KEY` and `QSTASH_NEXT_SIGNING_KEY` from the environment.
 */
export default verifySignature(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};