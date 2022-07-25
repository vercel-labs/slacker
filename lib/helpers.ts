import { sendSlackMessage } from "./slack";
import { decode } from "html-entities";
// @ts-ignore - no type info for this module
import mrkdwn from "html-to-mrkdwn";
import regexEscape from "escape-string-regexp";

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

export function regexOperations(post: any, keywords: string[]) {
  const mentionedTerms = new Set();

  // This transforms each keyword into the string to explicitly match the
  // keyword in a dynamically constructed regex. Eg,
  // ["Vercel", "NextJS"] -> ["\bVercel\b", "\bNextJS"\b"]
  const keywordWordBoundary = keywords.map(
    (keyword) => `\\b${regexEscape(keyword)}\\b`
  );

  // This regex will be of the form:
  //   const termsRegex = /(\bVercel\b)|(\bNextJS\b))\b/gi
  const termsRegex = new RegExp(`(${keywordWordBoundary.join(")|(")})`, "gi");

  const marked: string = mrkdwn(decode(post.text)).text;

  // We use String.replace here so that we can know which capture group is
  // actually matched, so that we can extract the appropriate keyword.
  combineText(post).replace(termsRegex, (_, ...terms: string[]) => {
    // In order to preserve the case-sensitivity of the keywords, we do a bit of meta-programming.
    // We generated N regex capture groups, and we want to see if any of them matched. The index
    // of the capture group matches the index of the keyword, so we can then decorate the actual
    // text in the post, and know which keyword matched.
    for (let i = 0; i < keywords.length; i++) {
      if (terms[i] !== undefined) {
        mentionedTerms.add(keywords[i]);
      }
    }

    // We don't actually care about the replaced text, we're just using this
    // for the side-effects.
    return "";
  });

  // This regex searches for formatted links, and for our keywords. "Vercel"
  // may appear in the link href (eg, "<https://vercel.com|Vercel> is
  // awesome!"), and we only want to decorate the link's text. We match:
  // - the `<https://vercel.com` link href first, so that we may ignore it when decorating.
  // - the `|https://vercel.com` href (where the link has no explicit text) second, so we can again ignore.
  // - the term "Vercel" word that doesn't appear inside either of those.
  // text second, so that we can decorate.
  // This regex will be of the form:
  //   const decorateRegex = /<http[^|]*|\|http[^>]*|(\bVercel\b|\bNextJS\b)/gi
  const decorateRegex = new RegExp(
    `<http[^|]*|\\|http[^>]*|(${keywordWordBoundary.join("|")})`,
    "gi"
  );

  const processedPost = marked.replace(decorateRegex, (match, term) => {
    // If we have a term, then it's something like "Vercel" and we can decorate it.
    if (term) {
      return "`*" + term + "*`";
    }

    // Else, we matched a link's href and we do not want to decorate.
    return match;
  });

  return {
    processedPost,
    mentionedTerms,
  };
}
