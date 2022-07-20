import type { NextApiRequest, NextApiResponse } from "next";
import { run } from "@/lib/run";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { authorization } = req.headers;
      console.log(authorization);
      if (authorization === `Bearer ${process.env.GH_ACTIONS_KEY}`) {
        const response = await run();
        console.log(response);
        res.status(200).json(response);
      } else {
        res.status(401).json({ success: false });
      }
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: err });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
