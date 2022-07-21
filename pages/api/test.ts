import { getPost, processPost } from "@/lib/helpers";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = await getPost(32175107); // test post id
  const response = await processPost(data);
  res.status(200).json(response);
}
