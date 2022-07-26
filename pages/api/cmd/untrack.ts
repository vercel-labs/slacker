import { removeKeyword } from "@/lib/upstash";
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

  const { team_id, command, text: rawText } = req.body;
  if (!team_id || !command) {
    return res.status(200).json({
      response_type: "ephemeral",
      text: "No team_id or command found",
    });
  }

  const text = rawText.toLowerCase(); // convert text to lowercase

  if (command !== "/untrack")
    // probably won't happen but by the off chance it does, we'll handle it
    return res.status(200).json({
      response_type: "ephemeral",
      text: "Invalid command",
    });

  if (text === "") {
    return res.status(200).json({
      response_type: "ephemeral",
      text: "No keyword included. You need to include a keyword to untrack: `/untrack <keyword>`",
    });
  }
  const response = await removeKeyword(team_id, text);
  if (response.result === 1) {
    console.log("Team *`" + team_id + "`* stopped tracking *`" + text + "`*");
    return res.status(200).json({
      response_type: "in_channel",
      text:
        "Successfully removed *`" +
        text +
        "`* from list of tracked keywords. Use the `/list` command to see all keywords.",
    });
  } else if (response.result === 0) {
    return res.status(200).json({
      response_type: "ephemeral",
      text: "*`" + text + "`* is not in the list of keywords.",
    });
  } else {
    return res.status(200).json({
      response_type: "ephemeral",
      text: "Error removing keyword.",
    });
  }
}
