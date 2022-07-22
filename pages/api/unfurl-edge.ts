import { decode } from "html-entities";
import { NextRequest, NextFetchEvent } from "next/server";

export const config = {
  runtime: "experimental-edge",
};

export default async function handler(req: NextRequest, ev: NextFetchEvent) {
  const keywords = await getKeywords();
  const body = await req.json();
  const channel = body.event.channel; // channel the message was sent in
  const ts = body.event.message_ts; // message timestamp
  const url = body.event.links[0].url; // url that was shared
  const newUrl = new URL(url);
  const id = newUrl.searchParams.get("id"); // get hacker news post id
  if (!id) {
    return new Response(JSON.stringify({ message: "No id found" }), {
      status: 400,
    });
  }
  ev.waitUntil(
    fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`) // get hacker news post data with the hacker news API
      .then((res) => res.json())
      .then((post) => {
        fetch("https://slack.com/api/chat.unfurl", {
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
              [url]: unfurlPostEdge(post, keywords),
            },
          }),
        });
      })
  );
  return new Response(JSON.stringify(body), {
    status: 200,
  });
}

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

export function unfurlPostEdge(post: any, keywords: string[]) {
  /* Unfurl a hacker news post to Slack using Slack's Attachments API: https://api.slack.com/messaging/composing/layouts#attachments */
  const mentionedTerms = keywords.filter((keyword) => {
    return post.text.toLowerCase().includes(keyword);
  });
  return {
    mrkdwn_in: ["author_name", "text", "footer"],
    fallback: `https://news.ycombinator.com/item?id=${post.id}`,
    author_name: `New <https://news.ycombinator.com/item?id=${post.id}|${post.type}> from <https://news.ycombinator.com/user?id=${post.by}|${post.by}>`,
    author_icon: `https://ui-avatars.com/api/?name=${post.by}&background=random`,
    text: decode(post.text),
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
  };
}
