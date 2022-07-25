import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { decode } from "html-entities";
// @ts-ignore - no type info for this module
import mrkdwn from "html-to-mrkdwn";
import { combineText, truncateString } from "./helpers";
import {
  clearDataForTeam,
  getAccessToken,
  getChannel,
  getKeywords,
} from "./upstash";
import { getPost, getParent } from "@/lib/hn";

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

export async function handleUnfurl(req: NextApiRequest, res: NextApiResponse) {
  /* Unfurl a hacker news post to Slack using Slack's Attachments API: https://api.slack.com/messaging/composing/layouts#attachments */

  const { team_id } = req.body;
  if (!team_id) {
    return res.status(400).json({ message: "No team_id found" });
  }
  const channel = req.body.event.channel; // channel the message was sent in
  const ts = req.body.event.message_ts; // message timestamp
  const url = req.body.event.links[0].url; // url that was shared
  const newUrl = new URL(url);
  const id = newUrl.searchParams.get("id"); // get hacker news post id
  if (!id) {
    return res.status(400).json({ message: "No id found" });
  }

  const post = await getPost(parseInt(id)); // get post data from hacker news API

  const accessToken = await getAccessToken(team_id); // get access token from upstash

  const keywords: string[] = await getKeywords(team_id); // get keywords from upstash

  const text = combineText(post);

  const mentionedTerms = new Set();

  // This regex searches for formatted links, and for our keywords. "Vercel"
  // may appear in the link href (eg, "<https://vercel.com|Vercel> is
  // awesome!"), and we only want to decorate the link's text. We match the
  // link text first, so that we may ignore it when decorating, and the
  // keywords second, so that we can decorate.
  // This regex will be of the form:
  //   const termsRegex = /http[^|]*|(\bvercel\b)|(\bnextjs\b))\b/gi
  const termsRegex = new RegExp(`<http[^|]*|(\\b${keywords.join('\\\\b)|(\\\\b')}\\b)`, 'gi');

  const processedPost = mrkdwn(decode(post.text)).text.replace(termsRegex, (match, ...terms) => {
    // In order to preserve the case-sensitivity of the keywords, we do a bit of meta-programming.
    // We generated N regex capture groups, and we want to see if any of them matched. The index
    // of the capture group matches the index of the keyword, so we can then decorate the actual
    // text in the post, and know which keyword matched.
    for (let i = 0; i < keywords.length; i++) {
      const term = terms[i];
      // If term matched, then we have "Vercel" or similar, and we can decorate it.
      if (term !== undefined) {
        mentionedTerms.add(keywords[i]);
        return `*${term}*`;
      }
    }

    // Else, we matched a link's href and we do not want to decorate.
    return match;
  });

  const originalPost = post.parent ? await getParent(post) : null; // if post is a comment, get title of original post

  const response = await fetch("https://slack.com/api/chat.unfurl", {
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
          ...(mentionedTerms.size > 0 && {
            fields: [
              {
                title: "Mentioned Terms",
                value: [...mentionedTerms].join(", "),
                short: false,
              },
            ],
          }),
          footer: `<https://news.ycombinator.com/item?id=${
            originalPost ? originalPost.id : post.id
          }|${
            originalPost // if original post exists, add a footer with the link to it
              ? `on: ${truncateString(originalPost.title, 40)}` // truncate the title to max 40 chars
              : "Hacker News"
          }> | <!date^${
            post.time
          }^{date_short_pretty} at {time}^${`https://news.ycombinator.com/item?id=${post.id}`}|Just Now>`,
          footer_icon:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Y_Combinator_logo.svg/1024px-Y_Combinator_logo.svg.png",
        },
      },
    }),
  });
  return res.status(200).json(response);
}

export function verifyRequestWithToken(req: NextApiRequest) {
  const { token } = req.body;
  return token === process.env.SLACK_VERIFICATION_TOKEN;
}

export async function handleUninstall(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!verifyRequestWithToken(req))
    // verify that the request is coming from the correct Slack team
    // here we use the verification token because for some reason signing secret doesn't work
    return res.status(403).json({
      message: "Nice try buddy. Slack signature mismatch.",
    });
  const { team_id } = req.body;
  const response = await clearDataForTeam(team_id);
  return res.status(200).json(response);
}
