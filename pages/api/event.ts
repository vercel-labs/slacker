import { handleUninstall, handleUnfurl } from "@/lib/slack";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.body.challenge) return res.status(200).json(req.body); // unique case for Slack challenge

  if (req.body.event.type === "app_uninstalled") {
    return handleUninstall(req, res);
  }

  if (req.body.event.type === "link_shared") {
    return handleUnfurl(req, res);
  }

  return res.status(404).json({ message: "Unknown event type" });
}
