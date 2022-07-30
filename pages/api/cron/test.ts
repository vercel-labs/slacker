import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const response = [
    {
      by: "ratww",
      id: 32185607,
      kids: [32186808, 32189384, 32186128, 32190316],
      parent: 32183437,
      text: "This is why I still like Agile and Scrum, as much as other devs might hate it. “Yeah I want REAL deliverables after the first or second week”.<p>Keeps me honest. And will keep me from working with architecture astronauts don’t really deliver anything but hot air and build ultra-extensible structures that are  actually impossible to extend beyond the fantasy world of their maker. Or the equivalent for designers.",
      time: 1658440117,
      type: "comment",
    },
  ];
  res.status(200).json(response);
}
