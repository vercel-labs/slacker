import type { NextApiRequest, NextApiResponse } from "next";
import { cron } from "@/lib/cron";
import { log } from "@/lib/slack";
import { isDuplicateCron } from "@/lib/upstash";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  if (await isDuplicateCron()) {
    // check if this is a duplicate cron job (threshold of 55s)
    return res.status(500).json({ message: "Duplicate cron job" });
  }
  try {
    const response = await cron();
    console.log("Cron job successful!");
    res.status(200).json({ message: "Cron job successful!" });
  } catch (err) {
    console.log("Cron job error:", err);
    await log("Cron job error: \n" + "```" + JSON.stringify(err) + "```");
    res.status(500).json({ statusCode: 500, message: err });
  }
}
