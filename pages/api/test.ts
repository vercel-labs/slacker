import { getPost, processPost } from "@/lib/helpers";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: "No id found" });
  }
  const data = await getPost(parseInt(id)); // test post id
  const response = await processPost(data);
  res.status(200).json(response);
}
