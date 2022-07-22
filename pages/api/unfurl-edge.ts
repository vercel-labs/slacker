import { getKeywords, unfurlPostEdge } from "@/lib/helpers";
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
