import { Redis } from "@upstash/redis";
import { getLatestPost } from "./hn";

export const redis = new Redis({
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
  return await redis.get(`${teamId}_token`);
}

export async function setAccessToken(accessToken: string, teamId: string) {
  /* Set the access token for a Slack team in redis */
  const slack = await fetch("https://slack.com/api/team.info", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((res) => res.json())
    .catch((err) => {
      console.log(err);
      return { ok: false, message: "Failed to fetch team info" };
    });

  const pipeline = redis.pipeline();
  pipeline.set(`${teamId}_token`, accessToken);
  pipeline.hset("metadata", {
    [teamId]: { joined: Date.now(), slack: slack.ok ? slack.team : null },
  });
  return await pipeline.exec();
}

export async function getKeywords(teamId: string): Promise<string[]> {
  /* Get list of keywords for a given team from redis */
  return (await redis.hget("keywords", teamId)) || [];
}

export async function addKeyword(teamId: string, keyword: string) {
  /* Add a keyword for a team in redis */
  const keywords = await getKeywords(teamId); // get list of keywords for team

  if (!keywords.includes(keyword)) {
    // if keyword is not already in list, add it
    keywords.push(keyword);
    await redis.hset("keywords", { [teamId]: keywords });
    return 1; // return 1 to indicate keyword was added (hset returns 0 if key already exists)
  } else {
    // if keyword is already in list
    return 0; // return 0 to indicate keyword already exists and was not added
  }
}

export async function removeKeyword(teamId: string, keyword: string) {
  /* Remove a keyword for a team in redis */
  const keywords = await getKeywords(teamId); // get list of keywords for team

  if (keywords.includes(keyword)) {
    // if keyword is in list, remove it
    keywords.splice(keywords.indexOf(keyword), 1);
    await redis.hset("keywords", { [teamId]: keywords });
    return 1; // return 1 to indicate keyword was removed (hset returns 0 if key already exists)
  } else {
    // if keyword is not in list
    return 0; // return 0 to indicate keyword was not in the list and was not removed
  }
}

export async function countKeywords(teamId: string) {
  /* Count the list of keywords from redis */
  return (await getKeywords(teamId)).length;
}

export async function getChannel(teamId: string) {
  /* Get the channel ID to send notifications in for a Slack team in redis */
  return await redis.get(`${teamId}_channel`);
}

export async function setChannel(teamId: string, channel: string) {
  /* Set the channel ID to send notifications in for a Slack team in redis */
  return await redis.set(`${teamId}_channel`, channel);
}

export async function getLastCheckedId(): Promise<number> {
  /* Get the last checked post ID from redis */
  const lastCheckedId = (await redis.get("lastCheckedId")) as number;
  if (!lastCheckedId) {
    // if lastCheckedId is not set (first time running), return the latest post ID on HN instead
    const latestPostId = await getLatestPost();
    return latestPostId;
  }
  return lastCheckedId;
}

export async function setLastCheckedId(id: number) {
  /* Set the last checked post ID in redis */
  return await redis.set("lastCheckedId", id);
}

export async function checkIfPostWasChecked(id: number) {
  /* Check if a post has been checked in redis – 
     if setting the key for the post returns null, it means it's already been set
     Here, we're setting the keys to expire in 24 hours 
  */
  return (
    (await redis.set(`post_${id}`, true, { nx: true, ex: 24 * 60 * 60 })) ===
    null
  );
}

export interface TeamAndKeywords {
  [teamId: string]: string[];
}

export async function getTeamsAndKeywords(): Promise<TeamAndKeywords> {
  /* Get all teams and their respective keywords */
  return (await redis.hgetall("keywords")) || {};
}

export async function clearDataForTeam(teamId: string) {
  /* Clear all data for a team */
  const metadata = (await redis.hget("metadata", teamId)) as {
    joined: string;
    slack: any;
  };
  const keywords = await redis.hget("keywords", teamId);
  const pipeline = redis.pipeline();
  pipeline.del(`${teamId}_token`);
  pipeline.del(`${teamId}_channel`);
  pipeline.hdel("keywords", teamId);
  pipeline.hset("metadata", { [teamId]: { ...metadata, keywords } });
  return await pipeline.exec();
}

export async function trackUnfurls(teamId: string) {
  /* Track unfurls for a team */
  return await redis.incr(`${teamId}_unfurls`);
}

export async function trackBotUsage(teamId: string) {
  /* Track unfurls for a team */
  return await redis.incr(`${teamId}_notifications`);
}

export interface TeamConfigAndStats {
  teamId: string;
  keywords: string[];
  channel: string;
  unfurls: number;
  notifications: number;
}

export async function getTeamConfigAndStats(
  teamId: string
): Promise<TeamConfigAndStats> {
  /* Pipeline function to retrieve the team's keywords, channel and usage stats (unfurls, notifications) */
  const pipeline = redis.pipeline();
  pipeline.hget("keywords", teamId);
  pipeline.mget(
    `${teamId}_channel`,
    `${teamId}_unfurls`,
    `${teamId}_notifications`
  );
  const json = await pipeline.exec<[string[], [string, number, number]]>();
  return {
    teamId,
    keywords: json[0] || [],
    channel: json[1][0],
    unfurls: json[1][1] || 0,
    notifications: json[1][2] || 0,
  };
}
