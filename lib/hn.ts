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
  const res = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
  );
  const json = await res.json();
  return json;
}
