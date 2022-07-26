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

  return await Promise.all(
    teamKeys.map(async (key) => {
      const teamId = key.replace("_keywords", "");
      const keywords = await getKeywords(teamId);
      return {
        teamId,
        keywords,
      };
    })
  );
}

export async function clearDataForTeam(teamId: string) {
  /* Clear all data for a team */
  const resKey = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/del/${teamId}_token`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );
  const delKey = await resKey.json();
  const resChannel = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/del/${teamId}_channel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );
  const delChannel = await resChannel.json();
  const resKeywords = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/del/${teamId}_keywords`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
  );
  const delKeywords = await resKeywords.json();
  return {
    delKey,
    delChannel,
    delKeywords,
  };
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
