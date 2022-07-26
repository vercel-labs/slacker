import { getKeywords } from "@/lib/upstash";
import { verifyRequest } from "@/lib/slack";
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
  if (!team_id || !command) {
    return res.status(200).json({
      response_type: "ephemeral",
      text: "No team_id or command found",
    });
  }

  if (command !== "/list")
    // probably won't happen but by the off chance it does, we'll handle it
    return res.status(200).json({
      response_type: "ephemeral",
      text: "Invalid command",
    });

  const response = await getKeywords(team_id); // get keywords for team

  if (response.length > 0) {
    return res.status(200).json({
      response_type: "ephemeral",
      text: `List of currently tracked words: \n  • *${response.join(
        "* \n  • *"
      )}*`,
    });
  } else if (response.length === 0) {
    return res.status(200).json({
      response_type: "ephemeral",
      text: "No keywords configured yet. Use `/track <keyword>` to add one.",
    });
  } else {
    return res.status(200).json({
      response_type: "ephemeral",
      text: "Error getting keywords.",
    });
  }
}
