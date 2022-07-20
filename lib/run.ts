import {
  getLatestPost,
  getPost,
  getLastCheckedId,
  setLastCheckedId,
  processPost,
} from "./helpers";

const NUM_THREADS = 5;

export async function run() {
  const lastCheckedId = await getLastCheckedId(); // get last checked post id from redis
  const latestPostId = await getLatestPost(); // get latest post id from hacker news
  const threadSize = Math.ceil((latestPostId - lastCheckedId) / NUM_THREADS); // get thread size (number of posts to check for each thread)
  let mentionedPosts: any[] = [];
  let deletedPosts: any[] = [];
  let errorPosts: any[] = [];
  await Promise.all(
    Array.from(Array(NUM_THREADS).keys()).map(async (i) => {
      const start = lastCheckedId + i * threadSize; // get start id for thread
      const end = Math.min(lastCheckedId + (i + 1) * threadSize, latestPostId); // get end id for thread
      console.log(start, end);
      for (let j = start; j < end; j++) {
        // iterate over posts in thread
        try {
          const post = await getPost(j); // get post from hacker news
          const res = await processPost(post); // process post
          console.log(res);
          if (res.status === "present") {
            mentionedPosts.push(post);
          }
          if (res.status === "deleted") {
            deletedPosts.push(post);
          }
          if (res.status === "error") {
            errorPosts.push(post);
          }
        } catch (err) {
          errorPosts.push(j);
        }
      }
    })
  );
  await setLastCheckedId(latestPostId);
  return {
    results: `Processed post ${lastCheckedId} to post ${latestPostId} (${
      latestPostId - lastCheckedId
    } posts)`,
    mentionedPosts,
    deletedPosts,
    errorPosts,
  };
}
