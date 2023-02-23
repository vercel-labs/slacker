/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const config = {
  runtime: "experimental-edge",
};

export const interBold = fetch(
  new URL("../../styles/Inter-SemiBold.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

export const interRegular = fetch(
  new URL("../../styles/Inter-Regular.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

export default async function handler(req: NextRequest) {
  const [interBoldData, interRegularData] = await Promise.all([
    interBold,
    interRegular,
  ]);

  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") || "Slacker";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "black",
          background: "radial-gradient(circle closest-side, #532a01, #000000)",
        }}
      >
        <svg
          width="512"
          height="512"
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: 80,
            height: 80,
            marginBottom: 16,
          }}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M512 256C512 397.385 397.385 512 256 512C152.813 512 63.8854 450.95 23.3657 363H358V282H1.30404C0.441684 273.451 0 264.777 0 256C0 114.615 114.615 0 256 0C358.795 0 447.44 60.5873 488.171 148H154V229H510.593C511.523 237.873 512 246.881 512 256Z"
            fill="white"
          />
        </svg>
        <h1
          style={{
            fontSize: "100px",
            fontFamily: "Inter Bold",
            background:
              "linear-gradient(to bottom right, #ffffff 40%, #532a01 100%)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: "5rem",
            letterSpacing: "-0.025em",
          }}
        >
          {title}
        </h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter Bold",
          data: interBoldData,
        },
        {
          name: "Inter Regular",
          data: interRegularData,
        },
      ],
    }
  );
}
