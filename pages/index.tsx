import type { NextPage } from "next";
import Head from "next/head";
import GithubCorner from "@/components/github-corner";
import AddToSlack from "@/components/add-to-slack";
import Image from "next/image";
import banner from "../public/banner.png";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Hacker News Slack Bot</title>
      </Head>
      <GithubCorner url="https://github.com/steven-tey/hacker-news-slack-bot" />

      <main className="flex flex-col space-y-5 items-center justify-center min-h-screen pb-20">
        <div className="relative w-[633px] h-[100px]">
          <Image
            src={banner}
            alt="Hacker News Slack Bot Banner"
            layout="fill"
          />
        </div>
        <div className="text-center max-w-lg space-y-3">
          <h1 className="text-4xl font-bold">Hacker News Slack Bot</h1>
          <p className="text-gray-600">
            A bot that monitors Hacker News for mentions of certain keywords,
            sends them to Slack, and shows a link preview.
          </p>
        </div>

        <div className="relative w-full max-w-xl h-96 border-2 border-black sm:rounded-lg overflow-hidden">
          <iframe
            src="https://www.loom.com/embed/223dee4199f540448c4182f2e3135f62"
            frameBorder="0"
            allowFullScreen
            style={{
              position: "absolute",
              zIndex: 5,
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          ></iframe>
          <Image
            src="https://cdn.loom.com/sessions/thumbnails/223dee4199f540448c4182f2e3135f62-1658869733112-with-play.gif"
            alt="Hacker News Bot"
            width={600}
            height={400}
          />
        </div>

        <AddToSlack />
      </main>
    </div>
  );
};

export default Home;
