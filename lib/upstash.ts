export async function getAccessToken(teamId: string) {
  /* Get the access token for a Slack team in redis */
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/get/${teamId}`,
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
    `${process.env.UPSTASH_REDIS_REST_URL}/set/${teamId}/${accessToken}`,
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
