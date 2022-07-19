import { decode } from "html-entities";
import TurndownService from "turndown";
const turndownService = new TurndownService();

const keywords = ["vercel", "nextjs", "next.js", "are"];

const SLACK_HOOK = process.env.SLACK_HOOK as string;
if (SLACK_HOOK === undefined) {
  throw "missing SLACK_HOOK env var!";
}

export async function getLatestPost() {
  const res = await fetch(
    `https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty`
  );
  const json = await res.json();
  return json as number;
}

export async function getPost(id: number) {
  const res = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
  );
  const json = await res.json();
  return json;
}

export async function processPost(post: any) {
  if (post.deleted) {
    return;
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
  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    if (text.toLowerCase().includes(keyword)) {
      await sendSlackMessage(post);
      return;
    }
  }
}

export async function sendSlackMessage(post: any) {
  const markdown = turndownService.turndown(decode(post.text));
  const processedMessage = `${
    post.title ? `*${post.title}* \n` : ""
  }${keywords.reduce(
    (acc, keyword) => acc.replace(new RegExp(keyword, "gi"), "*$&*"),
    markdown
  )}`;

  try {
    await fetch(SLACK_HOOK, {
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
              text: `https://news.ycombinator.com/item?id=${post.id}`,
            },
          },
        ],
        attachments: [
          {
            mrkdwn_in: ["author_name", "text", "footer"],
            fallback: `https://news.ycombinator.com/item?id=${post.id}`,
            color: "#ff6600",
            author_name: `New <https://news.ycombinator.com/item?id=${post.id}|${post.type}> from <https://news.ycombinator.com/user?id=${post.by}|${post.by}>`,
            author_icon: `https://ui-avatars.com/api/?name=${post.by}`,
            text: processedMessage,
            footer: `<https://news.ycombinator.com/item?id=${post.id}|Hacker News>`,
            footer_icon:
              "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Y_Combinator_logo.svg/1024px-Y_Combinator_logo.svg.png",
            ts: post.time,
          },
        ],
      }),
    });
  } catch (e) {
    throw e;
  }
}

export async function getLastCheckedId() {
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
