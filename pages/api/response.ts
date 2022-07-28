import { NextApiRequest, NextApiResponse } from "next";
import { addKeywords, removeKeyword, setChannel } from "@/lib/upstash";
import { verifyRequest, configureBlocks } from "@/lib/slack";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      response_type: "ephemeral",
      text: "This endpoint only accepts POST requests",
    });
  }
  if (!verifyRequest(req))
    // verify that the request is coming from the correct Slack team
    // here we use the verification token because for some reason signing secret doesn't work
    return res.status(403).json({
      message: "Nice try buddy. Slack signature mismatch.",
    });

  const payload = JSON.parse(req.body.payload);
  const { response_url, message, actions, team, channel } = payload;

  const oldKeywords = message.blocks
    .filter((block: any) => block.block_id === "keyword")
    .map((block: any) => block.text.text.replace(/[`*]+/g, ""));
  const newKeywords = new Set(oldKeywords) as Set<string>;

  const { action_id, ...data } = actions[0];

  if (action_id === "add_keyword") {
    const keywords = data.selected_options.map((item: any) => item.value);
    keywords.forEach((keyword: string) => newKeywords.add(keyword));

    const addResponse = await addKeywords(team.id, keywords);

    if (!addResponse.error) {
      // TODO: account for error
      const response = await fetch(response_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blocks: configureBlocks(Array.from(newKeywords), channel.id),
        }),
      });
      return res.status(200).json(response);
    }
  } else if (action_id === "remove_keyword") {
    const wordToRemove = data.value;
    newKeywords.delete(wordToRemove);

    const removeResponse = await removeKeyword(team.id, wordToRemove);

    if (!removeResponse.error) {
      const response = await fetch(response_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blocks: configureBlocks(Array.from(newKeywords), channel.id),
        }),
      });
      return res.status(200).json(response);
    }
  } else if (action_id === "set_channel") {
    const channel = data.selected_conversation;
    const setChannelResponse = await setChannel(team.id, channel);
    if (!setChannelResponse.error) {
      const response = await fetch(response_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blocks: configureBlocks(Array.from(newKeywords), channel),
        }),
      });
      return res.status(200).json(response);
    }
  }
}
