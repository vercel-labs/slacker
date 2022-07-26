import { getChannel, setChannel } from "@/lib/upstash";
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
    return res.status(200).send("No team_id or command found");
  }
  const text = rawText.toUpperCase(); // Slack channel IDs must be in upper case
  if (command === "/channel") {
    if (text === "") {
      const response = await getChannel(team_id);
      if (response) {
        return res.status(200).json({
          response_type: "ephemeral",
          text: `Current channel is set to <#${response}>.`,
        });
      } else {
        return res.status(200).json({
          response_type: "ephemeral",
          text: "No channel set yet. Use  /channel <`channel_id`> to set one.",
        });
      }
    } else {
      const response = await setChannel(team_id, text);
      if (response.result) {
        return res.status(200).json({
          response_type: "in_channel",
          text: `Successfully set notifications channel to <#${text}>.`,
        });
      } else {
        return res.status(200).json({
          response_type: "ephemeral",
          text: `Error setting channel.`,
        });
      }
    }
  } else {
    return res.status(200).send("Invalid command");
  }
}
