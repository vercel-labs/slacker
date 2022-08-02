import { getTeamConfigAndStats } from "@/lib/upstash";
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

  const { team_id, command } = req.body;

  if (command === "/configure") {
    const { keywords, channel, unfurls, notifications } =
      await getTeamConfigAndStats(team_id);

    return res.status(200).json({
      response_type: "ephemeral",
      text: "Configure your bot",
      unfurl_links: false, // do not unfurl links & media for bot configuration message
      unfurl_media: false,
      blocks: configureBlocks(keywords, channel, unfurls, notifications),
    });
  } else {
    return res.status(200).json({
      // account for old commands that are now deprecated
      response_type: "ephemeral",
      text:
        "The command `" +
        command +
        "` is deprecated. Please use `/configure` instead.",
    });
  }
}
