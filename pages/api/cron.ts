import type { NextApiRequest, NextApiResponse } from "next";
import { cron } from "@/lib/cron";
import crypto from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { authorization } = req.headers;
      if (
        authorization &&
        crypto.timingSafeEqual(
          Buffer.from(authorization),
          Buffer.from(`Bearer ${process.env.CRON_JOB_OAUTH_TOKEN}`)
        )
      ) {
        const response = await cron();
        res.status(200).json(response);
      } else {
        res.status(401).json({ message: "Unauthorized." });
      }
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: err });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
