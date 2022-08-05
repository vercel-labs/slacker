import pRetry from "p-retry";

export async function getLatestPost() {
  /* get latest post id from hacker news */
  const res = await fetch(
    `https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty`
  );
  const json = await res.json();
  return json as number;
}

export async function getPost(id: number) {
  /* get post data using its id from hacker news */
  const run = async () => {
    console.log("fetching post", id);
    const res = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
    );
    const json = await res.json();
    if (res.status === 404 || json === null) {
      throw new Error(res.statusText);
    }
    return json;
  };
  try {
    return await pRetry(run, {
      retries: 5,
      minTimeout: 50,
    });
  } catch (e) {
    return null;
  }
}

export async function getParent(post: any): Promise<any> {
  /* recursively get parent of post */
  if (!post.parent) {
    return post;
  } else {
    const parent = await getPost(post.parent);
    if (parent) {
      return getParent(parent);
    }
    console.log(`Hacker News post not found. Post number: ${post.id}`); // by the off chance that the post fails to fetch/doesn't exist, log it
    return post;
  }
}
