import { getKeywords, setKeywords } from "@/lib/helpers";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const response = await getKeywords();
    res.status(200).json(response);
  } else if (req.method === "PUT") {
    console.log(req.body.words);
    const response = await setKeywords(req.body.words);
    res.status(200).json(response);
  } else {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
