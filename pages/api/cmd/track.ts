import { addKeyword } from "@/lib/upstash";
import { verifyRequest } from "@/lib/slack";
import { NextApiRequest, NextApiResponse } from "next";
import { commonWords } from "manifest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!verifyRequest(req))
    // verify that the request is coming from the correct Slack team
    return res.status(200).json({
      response_type: "ephemeral",
      text: "Nice try buddy. Slack signature mismatch.",
    });

  const { team_id, command, text: rawText } = req.body;
  if (!team_id || !command) {
    return res.status(200).json({
      response_type: "ephemeral",
      text: "No team_id or command found",
    });
  }

  const text = rawText.toLowerCase().trim(); // convert text to lowercase and remove leading and trailing whitespace

  if (command !== "/track")
    // probably won't happen but by the off chance it does, we'll handle it
    return res.status(200).json({
      response_type: "ephemeral",
      text: "Invalid command",
    });

  if (text === "") {
    return res.status(200).json({
      response_type: "ephemeral",
      text: "No keyword included. You need to include a keyword to track: `/track <keyword>`",
    });
  }
  if (commonWords.includes(text)) {
    return res.status(200).json({
      response_type: "ephemeral",
      text: "The keyword `" + text + "` is too common. Try a different one.",
    });
  }
  const response = await addKeyword(team_id, text);
  // response.result is the number of words added, if 0 then the keyword already exists
  if (response.result === 1) {
    return res.status(200).json({
      response_type: "in_channel",
      text:
        "Successfully added *" +
        text +
        "* to list of tracked keywords. Use the `/list` command to see all keywords.",
    });
  } else if (response.result === 0) {
    return res.status(200).json({
      response_type: "ephemeral",
      text:
        "*" +
        text +
        "* is already in the list of tracked keywords. Use the `/list` command to see all keywords.",
    });
  } else {
    return res.status(200).json({
      response_type: "ephemeral",
      text: "Error adding keyword.",
    });
  }
}
