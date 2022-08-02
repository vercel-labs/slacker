import { decode } from "html-entities";
// @ts-ignore - no type info for this module
import mrkdwn from "html-to-mrkdwn";
import regexEscape from "escape-string-regexp";
import { TeamAndKeywords } from "@/lib/upstash";

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

export function postScanner(teamsAndKeywords: TeamAndKeywords) {
  const keywordMapping = new Map() as Map<string, string[]>;
  const keywords = new Set();

  for (const teamId of Object.keys(teamsAndKeywords)) {
    for (const keyword of teamsAndKeywords[teamId]) {
      keywords.add(keyword);

      let teams = keywordMapping.get(keyword);
      if (teams === undefined) {
        teams = [];
        keywordMapping.set(keyword, teams);
      }
      teams.push(teamId);
    }
  }

  const keywordArray = Array.from(keywords) as string[];
  const boundaries = keywordArray.map(
    (keyword) => `\\b${regexEscape(keyword)}\\b`
  );

  const scanner = new RegExp(`(${boundaries.join(")|(")})`, "gi"); // create a regex that matches all keywords

  return (post: any): Set<string> => {
    const text = combineText(post); // combine text from post's title, text, and url
    const teamsInterestedInThisPost = new Set() as Set<string>; // set of team IDs that are interested in this post

    text.replace(scanner, (_, ...terms) => {
      for (let i = 0; i < keywordArray.length; i++) {
        if (terms[i] !== undefined) {
          // if the keyword is found in the text
          const teamsSubscribedToThisKeyword = keywordMapping.get(
            keywordArray[i]
          );
          teamsSubscribedToThisKeyword!.forEach((teamId) => {
            // using ! here because we know teamsSubscribedToThisKeyword is always defined
            teamsInterestedInThisPost.add(teamId); // add team ID to set of teams that are interested in this post (if not already in set)
          });
          break;
        }
      }
      return ""; // replace all instances of keywords with empty string (just for the replace function, we're not actually interested in the text here)
    });

    return teamsInterestedInThisPost; // return set of team IDs that are interested in this post
  };
}

export function truncateString(str: string, num: number) {
  if (!str) return "";
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

  const marked: string = mrkdwn(decode(post?.text || ""))
    ? mrkdwn(decode(post?.text || "")).text
    : "";

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

  // This regex searches for our keywords, while also matching a few extra
  // patterns that we want to prevent a keyword match during.  Eg, "Vercel" may
  // appear in the link href (eg, "<https://vercel.com|Vercel> is awesome!"),
  // and we only want to decorate the link's text. We match:
  // - the ````` ```text``` ````` code blocks, so that we may ignore it when decorating.
  // - the `<https://vercel.com` link href first, so that we may ignore it when decorating.
  // - the `|https://vercel.com` href (where the link has no explicit text) second, so we can again ignore.
  // - the term "Vercel" word that doesn't appear inside either of those.
  // text second, so that we can decorate.
  // This regex will be of the form:
  //   const decorateRegex = /```(?:(?!```)[^])*|<http[^|]*|\|http[^>]*|(\bVercel\b|\bNextJS\b)/gi
  const decorateRegex = new RegExp(
    [
      "```(?:(?!```)[^])*", // code blocks, using a negative lookahead and an an "anything" `[^]` negative char class.
      `<http[^|]*`, // The href of a link
      `\\|http[^>]*`, // An auto-generated link without explicit text
      `(${keywordWordBoundary.join("|")})`, // Our keywords to decorate
    ].join("|"),
    "gi"
  );

  const processedPost = marked.replace(decorateRegex, (match, term) => {
    // If we have a term, then it's something like "Vercel" and we can decorate it.
    if (term) {
      return "*`" + term + "`*";
    }

    // Else, we matched a link's href and we do not want to decorate.
    return match;
  });

  return {
    processedPost,
    mentionedTerms,
  };
}

export const equalsIgnoreOrder = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  return a.sort().join(",") === b.sort().join(",");
};
