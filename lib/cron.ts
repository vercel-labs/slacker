import { getLatestPost, getPost } from "./hn";
import {
  getLastCheckedId,
  setLastCheckedId,
  checkIfPostWasChecked,
  getTeamsAndKeywords,
} from "./upstash";
import { equalsIgnoreOrder, postScanner } from "./helpers";
import { sendSlackMessage } from "./slack";

export async function cron() {
  // last checked post id from redis, latest post id from hacker news
  const [lastCheckedId, latestPostId] = await Promise.all([
    getLastCheckedId(),
    getLatestPost(),
  ]);

  if (latestPostId === lastCheckedId) {
    // if latest post id is the same as last checked id, do nothing
    return { results: "No new posts" };
  }

  const teamsAndKeywords = await getTeamsAndKeywords(); // get all team keys from redis
  const scanner = postScanner(teamsAndKeywords); // create a post scanner that contains all teams and their keywords in a constructed regex

  let results: {
    [postId: string]: string[]; // for each post, store the teams that it was sent to
  } = {};
  let errors: any[] = [];

  for (let i = lastCheckedId + 1; i <= latestPostId; i++) {
    if (await checkIfPostWasChecked(i)) continue; // avoid double checking posts

    const post = await getPost(i); // get post from hacker news
    if (!post) {
      console.log(`Hacker News post not found. Post number: ${i}`); // by the off chance that the post fails to fetch/doesn't exist, log it
      continue;
    }
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
          try {
            await sendSlackMessage(i, teamId); // send post to team
          } catch (e) {
            console.log(
              `Error sending post ${i} to team ${teamId}. Cause of error: ${e}`
            );
            errors.push({
              error: e,
              postId: i,
              teamId: teamId,
            }); // if there's an error, add it to errors
          }
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
    errors,
  };
}

export async function testCron(
  postsToTest: number[],
  fakeTeamsAndKeywords: { [teamId: string]: string[] },
  fakeInterestedTeams: { [postId: number]: string[] }
) {
  const scanner = postScanner(fakeTeamsAndKeywords);
  let results: { [postId: number]: string } = {};
  for (const id of postsToTest) {
    console.log(`checking for post ${id}`);
    const post = await getPost(id); // get post from hacker news
    if (!post) {
      results[id] = `Hacker News post not found.`;
      continue;
    }
    if (post.deleted) {
      continue; // if post is deleted, skip it
    }
    const interestedTeams = Array.from(scanner(post)); // get teams that are interested in this post
    if (!equalsIgnoreOrder(fakeInterestedTeams[id], interestedTeams)) {
      results[
        id
      ] = `Interested teams don't match. Expected: ${fakeInterestedTeams[id]}, Actual: ${interestedTeams}`;
    }
  }
  return {
    message:
      Object.keys(results).length > 0
        ? "Some tests failing"
        : "All tests passed",
    results,
  };
}
