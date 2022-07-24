import { getPost } from "@/lib/hn";
import { unfurlPost } from "@/lib/slack";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.body.challenge) return res.status(200).json(req.body); // unique case for Slack challenge

  const { team_id } = req.body;
  if (!team_id) {
    return res.status(400).json({ message: "No team_id found" });
  }
  const channel = req.body.event.channel; // channel the message was sent in
  const ts = req.body.event.message_ts; // message timestamp
  const url = req.body.event.links[0].url; // url that was shared
  const newUrl = new URL(url);
  const id = newUrl.searchParams.get("id"); // get hacker news post id
  if (!id) {
    return res.status(400).json({ message: "No id found" });
  }
  const post = await getPost(parseInt(id)); // get post data from hacker news API
  const response = await unfurlPost(team_id, post, url, channel, ts);
  return res.status(200).json(response);
}
