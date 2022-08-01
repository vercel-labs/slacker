import { testCron } from "@/lib/cron";
import type { NextApiRequest, NextApiResponse } from "next";

const postsToTest = [
  32273228, // target word directly next to a bracket, e.g. Vercel(Api)
  32257847, // target word inside a code block
  32179305, // target word in an inline-link
  32276017, // target word in title URL
];

const fakeTeamsAndKeywords = {
  VERCEL: ["next.js", "vercel", "javascript"],
  SUPABASE: ["supabase", "typescript"],
};

const fakeInterestedTeams = {
  32273228: ["VERCEL", "SUPABASE"],
  32257847: ["VERCEL", "SUPABASE"],
  32179305: ["VERCEL"],
  32276017: ["VERCEL"],
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const response = await testCron(
    postsToTest,
    fakeTeamsAndKeywords,
    fakeInterestedTeams
  );
  res.status(200).json(response);
}
