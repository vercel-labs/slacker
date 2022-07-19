import { Sema } from "async-sema";
import {
  getLatestPost,
  getPost,
  getLastCheckedId,
  setLastCheckedId,
  processPost,
} from "./helpers";

const NUM_THREADS = 5;

const sema = new Sema(
  NUM_THREADS // Allow 5 concurrent async calls
);

export async function run() {
  const lastCheckedId = await getLastCheckedId(); // get last checked post id from redis
  const latestPostId = await getLatestPost(); // get latest post id from hacker news
  const threadSize = Math.ceil((latestPostId - lastCheckedId) / NUM_THREADS); // get thread size (number of posts to check for each thread)
  await Promise.all(
    Array.from(Array(NUM_THREADS).keys()).map(async (i) => {
      await sema.acquire();
      const start = lastCheckedId + i * threadSize; // get start id for thread
      const end = Math.min(lastCheckedId + (i + 1) * threadSize, latestPostId); // get end id for thread
      console.log(start, end);
      for (let j = start; j < end; j++) {
        // iterate over posts in thread
        const post = await getPost(j); // get post from hacker news
        await processPost(post); // process post
      }
      sema.release();
    })
  );
  await setLastCheckedId(latestPostId);
}
