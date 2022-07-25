import { sendSlackMessage } from "./slack";

export function combineText(post: any) {
  /* combine text from post's title, text, and url */
  let text = "";
  if (post.url) {
    text += `${post.url}\n`;
  }
  if (post.title) {
    text += `${post.title}\n`;
  }
  if (post.text) {
    text += `${post.text}\n`;
  }
  return text;
}

export async function processPost(
  post: any,
  teamId: string,
  keywords: string[] = []
): Promise<{ status: "present" | "absent" | "deleted" | "error" }> {
  /* Process post to determine if it contains our keywords */
  if (post.deleted) {
    return { status: "deleted" };
  }
  const text = combineText(post);

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];

    /* 
      This regex matches all instances of a keyword that are not preceded or proceeded by alphabets
      e.g. keyword = `vite`:
      - ...the Vite framework is... => matches
      - ...we use vite. It is pretty... => matches
      - ...my app is at https://vite.vercel.app/ => matches
      - ...please send me an invite for... => does not match
    */
    if (RegExp(`(?<![A-Za-z])${keyword}(?![A-Za-z]+)`, "gmi").test(text)) {
      try {
        await sendSlackMessage(post.id, teamId); // send message to Slack
        return { status: "present" };
      } catch (err) {
        console.log(err);
        return { status: "error" };
      }
    }
  }
  return { status: "absent" };
}

export function truncateString(str: string, num: number) {
  if (str.length > num) {
    return str.slice(0, num) + "...";
  } else {
    return str;
  }
}
