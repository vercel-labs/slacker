import { getLatestPost, getPost } from "./hn";
import {
  getLastCheckedId,
  setLastCheckedId,
  getTeamsAndKeywords,
} from "./upstash";
import { processPost } from "./helpers";

export async function cron() {
  const lastCheckedId = await getLastCheckedId(); // get last checked post id from redis
  const latestPostId = await getLatestPost(); // get latest post id from hacker news

  if (latestPostId === lastCheckedId) {
    // if latest post id is the same as last checked id, do nothing
    return { results: "No new posts" };
  }

  const teamsAndKeywords = await getTeamsAndKeywords(); // get all team keys from redis

  let results: {
    [teamId: string]: {
      // team id
      mentionedPosts: number[]; // array of post ids that mention the keywords
      deletedPosts: number[]; // array of post ids that were deleted
      erroredPosts: number[]; // array of post ids that had an error
    };
  } = {}; // initialize results array

  for (let i = lastCheckedId + 1; i <= latestPostId; i++) {
    const post = await getPost(i); // get post from hacker news
    console.log("checking for keywords in post", i);
    await Promise.all(
      teamsAndKeywords.map(async ({ teamId, keywords }) => {
        const { status } = await processPost(post, teamId, keywords);
        if (results[teamId] === undefined) {
          results[teamId] = {
            mentionedPosts: [],
            deletedPosts: [],
            erroredPosts: [],
          };
        } // initialize results array for team if it doesn't exist
        if (status === "present") {
          results[teamId].mentionedPosts.push(i);
        } else if (status === "deleted") {
          results[teamId].deletedPosts.push(i);
        } else if (status === "error") {
          results[teamId].erroredPosts.push(i);
        }
      })
    );
  }
  await setLastCheckedId(latestPostId); // set last checked post id in redis
  return results;
}
