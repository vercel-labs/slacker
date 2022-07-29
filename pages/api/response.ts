import { NextApiRequest, NextApiResponse } from "next";
import { addKeyword, removeKeyword, setChannel } from "@/lib/upstash";
import { verifyRequest, respondToSlack } from "@/lib/slack";
import { commonWords } from "manifest";

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

  // get old keywords from the Slack message
  const oldKeywords = message.blocks
    .filter((block: any) => block.block_id.startsWith("keyword_"))
    .map((block: any) => block.block_id.replace("keyword_", ""));

  // create a newKeywords set from the old keywords list
  const newKeywords = new Set(oldKeywords) as Set<string>;

  // get the action type and the action value
  const { action_id, ...data } = actions[0];

  /* -----------------
   * ADDING A KEYWORD
   * -----------------
   * Here, we're adding a keyword to the list of keywords that are
   * monitored by the team.
   *
   * We first process the keyword by converting it to lowercase and
   * removing any leading or trailing whitespace and quotes.
   *
   * For the hosted service (https://hn-slack-bot.vercel.app),
   * we'll also define some abuse prevention measures for the added keyword.
   *
   * We also handle the case where Upstash fails to add the keyword.
   *
   * In all error cases, we respond to Slack with the same inputs as before
   * but with the addition of an error message.
   */
  if (action_id === "add_keyword") {
    const rawKeyword = data.value;
    const keyword = rawKeyword
      .toLowerCase()
      .trim()
      .replace(/[‘’“”'"]+/g, "");

    const hostedService = !!process.env.SLACK_OAUTH_TOKEN;

    if (hostedService) {
      if (commonWords.includes(keyword)) {
        // if the keyword too common, we'll reject it
        return await respondToSlack(
          response_url,
          oldKeywords,
          channel.id,
          "The keyword *`" + keyword + "`* is too common. Try a different one."
        );
      } else if (oldKeywords.length >= 15) {
        // if the team has too many keywords, we'll reject it
        return await respondToSlack(
          response_url,
          oldKeywords,
          channel.id,
          "You have too many keywords. Try removing some before adding more."
        );
      }
    }

    newKeywords.add(keyword); // add the keyword to the list of keywords
    const addResponse = await addKeyword(team.id, keyword);

    if (!addResponse.error) {
      return await respondToSlack(
        response_url,
        Array.from(newKeywords),
        channel.id
      );
    } else {
      return await respondToSlack(
        response_url,
        oldKeywords,
        channel.id,
        addResponse.error
      );
    }

    /* -----------------
     * REMOVING A KEYWORD
     * -----------------
     * Here, we're remove a keyword to the list of keywords that are
     * monitored by the team.
     * This is rather straightforward, with the same error handling
     * measures as adding a keyword.
     */
  } else if (action_id === "remove_keyword") {
    const wordToRemove = data.value;
    newKeywords.delete(wordToRemove);

    const removeResponse = await removeKeyword(team.id, wordToRemove);

    if (!removeResponse.error) {
      return await respondToSlack(
        response_url,
        Array.from(newKeywords),
        channel.id
      );
    } else {
      return await respondToSlack(
        response_url,
        oldKeywords,
        channel.id,
        removeResponse.error
      );
    }

    /* -----------------
     * SETTING A CHANNEL
     * -----------------
     * Here, we're setting the channel that the bot will post notifications to.
     * This is rather straightforward, with the same error handling
     * measures as adding a keyword.
     */
  } else if (action_id === "set_channel") {
    const channelId = data.selected_conversation;
    const setChannelResponse = await setChannel(team.id, channelId);
    if (!setChannelResponse.error) {
      return await respondToSlack(response_url, oldKeywords, channelId);
    } else {
      return await respondToSlack(
        response_url,
        oldKeywords,
        channel.id,
        setChannelResponse.error
      );
    }
  }
}
