import { NextApiRequest, NextApiResponse } from "next";
import {
  addKeyword,
  removeKeyword,
  setChannel,
  countKeywords,
} from "@/lib/upstash";
import { verifyRequest, log, respondToSlack } from "@/lib/slack";
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

  const verification = verifyRequest(req);
  if (!verification.status) {
    // verify that the request is coming from the correct Slack team
    return res.status(403).json({
      response_type: "ephemeral",
      text: "Nice try buddy. Slack signature mismatch.",
    });
  }

  const payload = JSON.parse(req.body.payload);
  const { response_url, message, actions, team } = payload;

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
   * For the hosted service (https://slacker.run),
   * we'll also define some abuse prevention measures for the added keyword.
   *
   * We also handle the case where Upstash fails to add the keyword.
   *
   * In all error cases, we respond to Slack with the same inputs as before
   * but with the addition of an error message.
   */
  if (action_id === "add_keyword") {
    const rawKeyword = data.value;
    if (!rawKeyword) {
      return respondToSlack(res, response_url, team.id, {
        keyword:
          ":warning: Please enter a keyword that is at least 3 characters long.",
      });
    }

    const keyword = rawKeyword
      .toLowerCase()
      .trim()
      .replace(/[‘’“”'"]+/g, "");

    const hostedService = !process.env.SLACK_OAUTH_TOKEN;

    if (hostedService) {
      const keywordsCount = await countKeywords(team.id);

      // if the keyword too common, we'll reject it
      if (commonWords.includes(keyword)) {
        return respondToSlack(res, response_url, team.id, {
          keyword:
            ":warning: The keyword `" +
            keyword +
            "` is too common. Try a different one.",
        });
      } else if (keywordsCount >= 15) {
        // if the team has too many keywords, we'll reject it
        return respondToSlack(res, response_url, team.id, {
          keyword:
            ":warning: You have too many keywords. Try removing some before adding more.",
        });
      }
    }

    const response = await addKeyword(team.id, keyword);
    if (response === 1) {
      await log("Team *`" + team.id + "`* is now tracking *`" + keyword + "`*");
      return respondToSlack(res, response_url, team.id);
    } else {
      return respondToSlack(res, response_url, team.id, {
        keyword: `:warning: Failed to add keyword. Cause: ${
          response === 0 ? "Keyword already exists" : response
        }`,
      });
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

    const response = await removeKeyword(team.id, wordToRemove);
    if (response === 1) {
      await log(
        "Team *`" + team.id + "`* stopped tracking *`" + wordToRemove + "`*"
      );
      return respondToSlack(res, response_url, team.id);
    } else {
      return respondToSlack(res, response_url, team.id, {
        keyword: `:warning: Failed to remove keyword. Cause: ${
          response === 0 ? "Keyword not found" : response
        }`,
      });
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
    const response = await setChannel(team.id, channelId);
    if (response === "OK") {
      return respondToSlack(res, response_url, team.id, {
        channel: `:white_check_mark: Successfully set channel to <#${channelId}>`,
      });
    } else {
      return respondToSlack(res, response_url, team.id, {
        channel: `:warning: Failed to set channel. Cause: ${response}`,
      });
    }
  }
}
