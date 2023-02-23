import type { NextApiRequest, NextApiResponse } from "next";
import { cron } from "@/lib/cron";
import { log } from "@/lib/slack";
import { ratelimit } from "@/lib/upstash";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const { success } = await ratelimit.limit("cron");
  if (!success) {
    return new Response("Don't DDoS me pls 🥺", { status: 429 });
  }
  try {
    const response = await cron();
    console.log("Cron job successful! Response:", response);
    res.status(200).json(response);
  } catch (err) {
    console.log("Cron job error:", err);
    await log("Cron job error: \n" + "```" + JSON.stringify(err) + "```");
    res.status(500).json({ statusCode: 500, message: err });
  }
}
