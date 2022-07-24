import { NextApiRequest } from "next";
import crypto from "crypto";
import { decode } from "html-entities";
// @ts-ignore - no type info for this module
import mrkdwn from "html-to-mrkdwn";
import { combineText } from "./helpers";
import { getAccessToken, getChannel, getKeywords } from "./upstash";

export function verifyRequest(req: NextApiRequest) {
  const {
    "x-slack-signature": slack_signature,
    "x-slack-request-timestamp": timestamp,
  } = req.headers as { [key: string]: string };

  if (!slack_signature || !timestamp) {
    return false; // no signature or timestamp found
  }
  if (process.env.SLACK_SIGNING_SECRET === undefined) {
    return false; // no signing secret found
  }
  if (
    Math.abs(Math.floor(new Date().getTime() / 1000) - parseInt(timestamp)) >
    60 * 5
  ) {
    return false; // request timestamp differs from current timestamp by more than 5 minutes
  }
  const req_body = new URLSearchParams(req.body).toString(); // convert body to URL search params
  const sig_basestring = "v0:" + timestamp + ":" + req_body; // create base string
  const my_signature = // create signature
    "v0=" +
    crypto
      .createHmac("sha256", process.env.SLACK_SIGNING_SECRET as string)
      .update(sig_basestring)
      .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(slack_signature),
    Buffer.from(my_signature)
  );
}

export async function sendSlackMessage(postId: number, teamId: string) {
  /* Send a message containing the link to the hacker news post to Slack */
  const accessToken = await getAccessToken(teamId);
  const channelId = await getChannel(teamId);
  console.log(
    `Sending message to team ${teamId} in channel ${channelId} for post ${postId}`
  );
  try {
    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        text: `https://news.ycombinator.com/item?id=${postId}`,
        channel: channelId,
        unfurl_links: true,
      }),
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function unfurlPost(
  teamId: string,
  post: any,
  url: string,
  channel: string,
  ts: string
) {
  /* Unfurl a hacker news post to Slack using Slack's Attachments API: https://api.slack.com/messaging/composing/layouts#attachments */

  const accessToken = await getAccessToken(teamId); // get access token from upstash

  const keywords: string[] = await getKeywords(teamId); // get keywords from upstash

  const text = combineText(post);
  const mentionedTerms = keywords.filter((keyword) => {
    // similar regex as the one in `processPost()`
    return RegExp(`(?<![A-Za-z])${keyword}(?![A-Za-z]+)`, "gmi").test(text);
  });

  const processedPost = mrkdwn(decode(post.text)).text;

  return await fetch("https://slack.com/api/chat.unfurl", {
    // unfurl the hacker news post using the Slack API
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      channel,
      ts,
      unfurls: {
        [url]: {
          mrkdwn_in: ["author_name", "text", "footer"],
          fallback: `https://news.ycombinator.com/item?id=${post.id}`,
          author_name: `New <https://news.ycombinator.com/item?id=${post.id}|${post.type}> from <https://news.ycombinator.com/user?id=${post.by}|${post.by}>`,
          author_icon: `https://ui-avatars.com/api/?name=${post.by}&background=random`,
          ...(post.title && {
            title: post.title,
            title_link: `https://news.ycombinator.com/item?id=${post.id}`,
          }),
          text: processedPost,
          ...(mentionedTerms.length > 0 && {
            fields: [
              {
                title: "Mentioned Terms",
                value: mentionedTerms.join(", "),
                short: false,
              },
            ],
          }),
          footer: `<https://news.ycombinator.com/item?id=${
            post.id
          }|Hacker News> | <!date^${
            post.time
          }^{date_short_pretty} at {time}^${`https://news.ycombinator.com/item?id=${post.id}`}|Just Now>`,
          footer_icon:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Y_Combinator_logo.svg/1024px-Y_Combinator_logo.svg.png",
        },
      },
    }),
  });
}
