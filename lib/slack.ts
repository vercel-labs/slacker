import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { truncateString, regexOperations } from "./helpers";
import {
  clearDataForTeam,
  getAccessToken,
  getChannel,
  getKeywords,
  trackBotUsage,
  trackUnfurls,
  getTeamConfigAndStats,
} from "./upstash";
import { getPost, getParent } from "@/lib/hn";

export function verifyRequest(req: NextApiRequest) {
  /* Verify that requests are genuinely coming from Slack and not a forgery */
  const {
    "x-slack-signature": slack_signature,
    "x-slack-request-timestamp": timestamp,
  } = req.headers as { [key: string]: string };

  if (!slack_signature || !timestamp) {
    return {
      status: false,
      message: "No slack signature or timestamp found in request headers.",
    };
  }
  if (process.env.SLACK_SIGNING_SECRET === undefined) {
    return {
      status: false,
      message: "`SLACK_SIGNING_SECRET` env var is not defined.",
    };
  }
  if (
    Math.abs(Math.floor(new Date().getTime() / 1000) - parseInt(timestamp)) >
    60 * 5
  ) {
    return {
      status: false,
      message: "Nice try buddy. Slack signature mismatch.",
    };
  }
  const req_body = new URLSearchParams(req.body).toString(); // convert body to URL search params
  const sig_basestring = "v0:" + timestamp + ":" + req_body; // create base string
  const my_signature = // create signature
    "v0=" +
    crypto
      .createHmac("sha256", process.env.SLACK_SIGNING_SECRET as string)
      .update(sig_basestring)
      .digest("hex");

  if (
    crypto.timingSafeEqual(
      Buffer.from(slack_signature),
      Buffer.from(my_signature)
    )
  ) {
    return {
      status: true,
      message: "Verified Request.",
    };
  } else {
    return {
      status: false,
      message: "Nice try buddy. Slack signature mismatch.",
    };
  }
}

export async function sendSlackMessage(postId: number, teamId: string) {
  /* Send a message containing the link to the hacker news post to Slack */
  const [accessToken, channelId] = await Promise.all([
    getAccessToken(teamId),
    getChannel(teamId),
  ]);
  console.log(
    `Sending message to team ${teamId} in channel ${channelId} for post ${postId}`
  );
  const response = await fetch("https://slack.com/api/chat.postMessage", {
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
  const trackResponse = await trackBotUsage(teamId); // track bot usage for a team
  return {
    response,
    trackResponse,
  };
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

  const [post, accessToken, keywords] = await Promise.all([
    getPost(parseInt(id)), // get post data from hacker news API
    getAccessToken(team_id), // get access token from upstash
    getKeywords(team_id), // get keywords from upstash
  ]);

  const { processedPost, mentionedTerms } = regexOperations(post, keywords); // get post data with keywords highlighted

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
          author_name: `New ${post.type} from ${post.by}`,
          author_link: `https://news.ycombinator.com/item?id=${post.id}`,
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
                value: Array.from(mentionedTerms).join(", "),
                short: false,
              },
            ],
          }),
          footer: `<https://news.ycombinator.com/item?id=${
            originalPost ? originalPost.id : post.id
          }|${
            originalPost?.title // if original post exists, add a footer with the link to it
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
  const trackResponse = await trackUnfurls(team_id); // track unfurl usage for a team

  return res.status(200).json({
    response,
    trackResponse,
  });
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
  const logResponse = await log(
    "Team *`" + team_id + "`* just uninstalled the bot :cry:"
  );
  return res.status(200).json({
    response,
    logResponse,
  });
}

export async function log(message: string) {
  /* Log a message to the console */
  console.log(message);
  if (!process.env.VERCEL_SLACK_HOOK) return;
  try {
    return await fetch(process.env.VERCEL_SLACK_HOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: message,
            },
          },
        ],
      }),
    });
  } catch (e) {
    console.log(`Failed to log to Vercel Slack. Error: ${e}`);
  }
}

export const configureBlocks = (
  keywords: string[],
  channel: string,
  unfurls: number,
  notifications: number,
  feedback?: {
    keyword?: string;
    channel?: string;
  }
) => [
  {
    type: "header",
    text: {
      type: "plain_text",
      text: ":hammer_and_wrench:  Bot Configuration  :hammer_and_wrench:",
    },
  },
  {
    type: "context",
    block_id: "stats",
    elements: [
      {
        type: "mrkdwn",
        text: `Current Usage: ${unfurls} link previews shown, ${notifications} notifications sent |  <https://slack.com/apps/A03QV0U65HN|More Configuration Settings>`,
      },
    ],
  },
  {
    type: "divider",
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: ":bulb: KEYWORDS :bulb:",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text:
        keywords.length > 0
          ? "Here's the list of keywords that you're currently tracking:"
          : "_No keywords configured yet._",
    },
  },
  ...(keywords.length > 0
    ? keywords.map((keyword: any) => ({
        type: "section",
        block_id: `keyword_${keyword}`,
        text: {
          type: "mrkdwn",
          text: "`" + keyword + "`",
        },
        accessory: {
          action_id: "remove_keyword",
          type: "button",
          text: {
            type: "plain_text",
            text: "Remove",
          },
          value: keyword,
        },
      }))
    : []),
  {
    type: "input",
    dispatch_action: true,
    element: {
      type: "plain_text_input",
      action_id: "add_keyword",
      placeholder: {
        type: "plain_text",
        text: "Add a keyword (must be between 3 and 30 characters)",
      },
      dispatch_action_config: {
        trigger_actions_on: ["on_enter_pressed"],
      },
      min_length: 3,
      max_length: 30,
      focus_on_load: true,
    },
    label: {
      type: "plain_text",
      text: " ",
    },
  },
  ...(feedback?.keyword
    ? [
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: feedback.keyword,
            },
          ],
        },
      ]
    : []),
  {
    type: "divider",
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: ":hash: CHANNEL :hash:",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "Select a public channel to receive notifications in:",
    },
    accessory: {
      action_id: "set_channel",
      type: "conversations_select",
      placeholder: {
        type: "plain_text",
        text: "Select a channel...",
        emoji: true,
      },
      ...(channel ? { initial_conversation: channel } : {}),
    },
  },
  ...(feedback?.channel
    ? [
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: feedback.channel,
            },
          ],
        },
      ]
    : []),
  {
    type: "divider",
  },
  {
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: "Made and <https://hn-slack-bot.vercel.app/|open-sourced> with :black_heart: by <https://vercel.com/|▲ Vercel>",
      },
    ],
  },
];

export async function respondToSlack(
  res: NextApiResponse,
  response_url: string,
  teamId: string,
  feedback?: {
    keyword?: string;
    channel?: string;
  }
) {
  const { keywords, channel, unfurls, notifications } =
    await getTeamConfigAndStats(teamId); // get the latest state of the bot configurations to make sure it's up to date

  // respond to Slack with the new state of the bot
  const response = await fetch(response_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      blocks: configureBlocks(
        keywords,
        channel,
        unfurls,
        notifications,
        feedback
      ),
    }),
  });
  return res.status(200).json(response);
}
