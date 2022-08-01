import { getTeamsAndKeywords, redis } from "@/lib/upstash";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  //   const keys = await redis.keys("*_keywords");
  //   const pipeline = redis.pipeline();
  //   keys.forEach((key) => {
  //     pipeline.smembers(key);
  //   });
  //   const keywords = await pipeline.exec();
  //   const results = keys.map((key, index) => {
  //     return {
  //       teamId: key.split("_")[0],
  //       keywords: keywords[index],
  //     };
  //   });
  //   console.log(results);

  //   const newPipeline = redis.pipeline();
  //   results.forEach((result) => {
  //     newPipeline.hset("keywords", { [result.teamId]: result.keywords });
  //   });
  //   const response = await newPipeline.exec();
  const response = await getTeamsAndKeywords();

  res.status(200).json(response);
}
