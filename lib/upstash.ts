import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export async function isDuplicateCron() {
  /* Function to check for duplicate cron jobs:
   * nx  tells it to only set the key if it does not exist yet, otherwise an error is returned
   * ex  sets the TTL on the key to 5 seconds
   * This function should return string OK  if the key did not exists and was set correctly
   * or null  if the key already existed
   */
  const response = await redis.set("dedupIndex", "set", { nx: true, ex: 5 });
  return response === null;
}

export async function getAccessToken(teamId: string) {
  // If you are self hosting this app & have set a SLACK_OAUTH_TOKEN env var, you can just return it here.
  if (process.env.SLACK_OAUTH_TOKEN) return process.env.SLACK_OAUTH_TOKEN;

  /* Get the access token for a Slack team in redis */
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/get/${teamId}_token`,
    {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );
  const json = await res.json();
  return json.result as string;
}

export async function setAccessToken(teamId: string, accessToken: string) {
  /* Set the access token for a Slack team in redis */
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/set/${teamId}_token/${accessToken}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );
  return await res.json();
}

export async function getKeywords(teamId: string) {
  /* Get list of keywords from redis */
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/smembers/${teamId}_keywords`,
    {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );
  const json = await res.json();
  return json.result as string[];
}

export async function addKeyword(teamId: string, keyword: string) {
  /* Set the last checked post ID in redis */
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/sadd/${teamId}_keywords/${keyword}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );
  return await res.json();
}

export async function removeKeyword(teamId: string, keyword: string) {
  /* Set the last checked post ID in redis */
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/srem/${teamId}_keywords/${keyword}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );
  return await res.json();
}

export async function countKeywords(teamId: string) {
  /* Get list of keywords from redis */
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/scard/${teamId}_keywords`,
    {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );
  const json = await res.json();
  return json.result as number;
}

export async function getChannel(teamId: string) {
  /* Get the channel ID to send notifications in for a Slack team in redis */
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/get/${teamId}_channel`,
    {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );
  const json = await res.json();
  return json.result as string;
}

export async function setChannel(teamId: string, channel: string) {
  /* Set the channel ID to send notifications in for a Slack team in redis */
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/set/${teamId}_channel/${channel}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );
  return await res.json();
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

export interface TeamAndKeywords {
  teamId: string;
  keywords: string[];
}

export async function getTeamsAndKeywords() {
  /* Get all teams and their respective keywords */

  // First, get all the keys that end with `_keywords`
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/keys/*_keywords`,
    {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );
  const json = await res.json();
  const teamKeys = json.result as string[];

  // pipeline to get the keywords for each team
  const response = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/pipeline`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
      body: JSON.stringify(teamKeys.map((key) => ["SMEMBERS", key])),
    }
  );
  const results = await response.json();
  return teamKeys.map((key, i) => {
    if (results[i].error) {
      console.log(
        "Error getting keywords for team:",
        key.replace("_keywords", "")
      );
    }
    return {
      teamId: key.replace("_keywords", ""),
      keywords: (results[i].result as string[]) || [],
    };
  });
}

export async function clearDataForTeam(teamId: string) {
  /* Clear all data for a team */
  const response = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/pipeline`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
      body: JSON.stringify([
        ["DEL", `${teamId}_token`],
        ["DEL", `${teamId}_keywords`],
        ["DEL", `${teamId}_channel`],
      ]),
    }
  );
  return await response.json();
}

export async function trackUnfurls(teamId: string) {
  /* Track unfurls for a team */
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/incr/${teamId}_unfurls`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );
  return await res.json();
}

export async function trackBotUsage(teamId: string) {
  /* Track unfurls for a team */
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/incr/${teamId}_notifications`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );
  return await res.json();
}

export interface TeamConfigAndStats {
  teamId: string;
  keywords: string[];
  channel: string;
  unfurls: number;
  notifications: number;
}

export async function getTeamConfigAndStats(teamId: string) {
  /* Pipeline function to retrieve the team's keywords, channel and usage stats (unfurls, notifications) */
  const response = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/pipeline`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
      body: JSON.stringify([
        ["SMEMBERS", `${teamId}_keywords`],
        ["GET", `${teamId}_channel`],
        ["GET", `${teamId}_unfurls`],
        ["GET", `${teamId}_notifications`],
      ]),
    }
  );
  const json = await response.json();
  return {
    teamId,
    keywords: json[0].result,
    channel: json[1].result,
    unfurls: json[2].result || 0,
    notifications: json[3].result || 0,
  } as TeamConfigAndStats;
}
