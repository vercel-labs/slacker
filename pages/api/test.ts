import { getKeywords, getPost, processPost } from "@/lib/helpers";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query as { id?: string };
  if (!id) {
    return res.status(400).json({ message: "No id found" });
  }
  const post = await getPost(parseInt(id)); // test post id
  const keywords = await getKeywords();
  const response = await processPost(post, keywords);
  res.status(200).json(response);
}
