import { getChannel, getKeywords } from "@/lib/upstash";
import { verifyRequest, configureBlocks } from "@/lib/slack";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const verification = verifyRequest(req);
  if (!verification.status)
    // verify that the request is coming from the correct Slack team
    return res.status(200).json({
      response_type: "ephemeral",
      text: verification.message,
    });

  const { team_id } = req.body;

  const keywords = await getKeywords(team_id); // get keywords for team
  const channel = await getChannel(team_id); // get keywords for team

  return res.status(200).json({
    response_type: "in_channel",
    text: "Configure your bot",
    blocks: configureBlocks(keywords, channel),
  });
}
