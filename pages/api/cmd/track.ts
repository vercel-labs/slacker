import { addKeyword, countKeywords } from "@/lib/upstash";
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

  const text = rawText
    .toLowerCase()
    .trim()
    .replace(/[‘’“”]+/g, ""); // convert text to lowercase and remove leading and trailing whitespace & quotes

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

  const selfHosted = process.env.SLACK_OAUTH_TOKEN;

  if (!selfHosted) {
    // define some abuse prevention measures for hosted service (https://hn-bot.vercel.app)
    if (commonWords.includes(text)) {
      // if the keyword too common, we'll reject it
      return res.status(200).json({
        response_type: "ephemeral",
        text: "The keyword `" + text + "` is too common. Try a different one.",
      });
    }
    if (text.length > 30) {
      // if the keyword is too long, we'll reject it
      return res.status(200).json({
        response_type: "ephemeral",
        text: "The keyword *`" + text + "`* is too long. Try a different one.",
      });
    }
    const keywordsCount = await countKeywords(team_id);
    if (keywordsCount >= 15) {
      // if the team has too many keywords, we'll reject it
      return res.status(200).json({
        response_type: "ephemeral",
        text: "You are tracking too many keywords (max 15). Try deleting some before adding more.",
      });
    }
  }

  const response = await addKeyword(team_id, text);
  // response.result is the number of words added, if 0 then the keyword already exists
  if (response.result === 1) {
    return res.status(200).json({
      response_type: "in_channel",
      text:
        "Successfully added *`" +
        text +
        "`* to list of tracked keywords. Use the `/list` command to see all keywords.",
    });
  } else if (response.result === 0) {
    return res.status(200).json({
      response_type: "ephemeral",
      text:
        "*`" +
        text +
        "`* is already in the list of tracked keywords. Use the `/list` command to see all keywords.",
    });
  } else {
    return res.status(200).json({
      response_type: "ephemeral",
      text: "Error adding keyword.",
    });
  }
}
