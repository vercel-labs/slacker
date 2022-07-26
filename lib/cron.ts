import { getLatestPost, getPost } from "./hn";
import {
  getLastCheckedId,
  setLastCheckedId,
  getTeamsAndKeywords,
} from "./upstash";
import { postScanner } from "./helpers";
import { sendSlackMessage } from "./slack";

export async function cron() {
  const lastCheckedId = await getLastCheckedId(); // get last checked post id from redis
  const latestPostId = await getLatestPost(); // get latest post id from hacker news

  if (latestPostId === lastCheckedId) {
    // if latest post id is the same as last checked id, do nothing
    return { results: "No new posts" };
  }

  const teamsAndKeywords = await getTeamsAndKeywords(); // get all team keys from redis
  const scanner = postScanner(teamsAndKeywords); // create a post scanner that contains all teams and their keywords in a constructed regex

  let results: {
    [postId: string]: string[]; // for each post, store the teams that it was sent to
  } = {};

  for (let i = lastCheckedId + 1; i <= latestPostId; i++) {
    const post = await getPost(i); // get post from hacker news
    if (post.deleted) {
      continue; // if post is deleted, skip it
    }
    console.log("checking for keywords in post", i);
    const interestedTeams = Array.from(scanner(post)); // get teams that are interested in this post
    if (interestedTeams.length > 0) {
      results[i] = interestedTeams; // add post id and interested teams to results
      await Promise.all(
        interestedTeams.map(async (teamId) => {
          console.log("sending post to team", teamId);
          await sendSlackMessage(i, teamId);
        })
      );
    }
  }

  await setLastCheckedId(latestPostId); // set last checked post id in redis
  return {
    summary: `Processed post ${lastCheckedId} to post ${latestPostId} (${
      latestPostId - lastCheckedId
    } posts)`,
    results,
  };
}
