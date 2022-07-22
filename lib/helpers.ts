import { decode } from "html-entities";
// @ts-ignore - no type info for this module
import mrkdwn from "html-to-mrkdwn";

export async function getKeywords() {
  /* Get list of keywords from redis */
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/get/keywords`,
    {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );
  const json = await res.json();
  return JSON.parse(json.result) as string[];
}

export async function setKeywords(keywords: string[]) {
  /* Set the last checked post ID in redis */
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/set/keywords`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
      body: JSON.stringify(keywords),
    }
  );
  return await res.json();
}

export async function getLatestPost() {
  /* get latest post id from hacker news */
  const res = await fetch(
    `https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty`
  );
  const json = await res.json();
  return json as number;
}

export async function getPost(id: number) {
  /* get post data using its id from hacker news */
  const res = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
  );
  const json = await res.json();
  return json;
}

export async function processPost(
  post: any
): Promise<{ status: "present" | "absent" | "deleted" | "error" }> {
  /* Process post to determine if it contains our keywords */
  if (post.deleted) {
    return { status: "deleted" };
  }
  let text = "";
  if (post.url) {
    text += `${post.url}\n`;
  }
  if (post.title) {
    text += `${post.title}\n`;
  }
  if (post.text) {
    text += `${post.text}\n`;
  }
  const keywords = await getKeywords();
  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    if (text.toLowerCase().includes(keyword)) {
      try {
        await sendSlackMessage(post.id);
        return { status: "present" };
      } catch (err) {
        console.log(err);
        return { status: "error" };
      }
    }
  }
  return { status: "absent" };
}

export async function sendSlackMessage(id: number) {
  /* Send a message containing the link to the hacker news post to Slack */
  try {
    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SLACK_BOT_OAUTH_TOKEN}`,
      },
      body: JSON.stringify({
        text: `https://news.ycombinator.com/item?id=${id}`,
        channel: "C03QV0M5GNL",
        unfurl_links: true,
      }),
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function unfurlPost(
  post: any,
  url: string,
  channel: string,
  ts: string
) {
  /* Unfurl a hacker news post to Slack using Slack's Attachments API: https://api.slack.com/messaging/composing/layouts#attachments */
  const keywords = await getKeywords();

  const mentionedTerms = keywords.filter((keyword) => {
    return post.text.toLowerCase().includes(keyword);
  });

  const processedPost = mrkdwn(decode(post.text));

  return await fetch("https://slack.com/api/chat.unfurl", {
    // unfurl the hacker news post using the Slack API
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SLACK_BOT_OAUTH_TOKEN}`,
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

export async function getLastCheckedId() {
  /* Get the last checked post ID from redis */
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/get/lastCheckedId`,
    {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );
  const json = await res.json();
  return parseInt(json.result) as number;
}

export async function setLastCheckedId(id: number) {
  /* Set the last checked post ID in redis */
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/set/lastCheckedId/${id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );
  const json = await res.json();
  return json as number;
}
