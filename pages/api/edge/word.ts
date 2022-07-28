import { NextRequest } from "next/server";

export const config = {
  runtime: "experimental-edge",
};

export default async function handler(req: NextRequest) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const text = await req.text();
  const payload = JSON.parse(decodeURIComponent(text).replace("payload=", ""));
  const { value } = payload;

  const response = {
    options: [
      {
        text: {
          type: "plain_text",
          text: value,
        },
        value: value,
      },
    ],
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
