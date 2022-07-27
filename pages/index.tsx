import type { NextPage } from "next";
import Head from "next/head";
import GithubCorner from "@/components/github-corner";
import AddToSlack from "@/components/add-to-slack";
import Image from "next/image";
import bannerImage from "../public/banner.png";
import demoGif from "../public/demo.gif";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Hacker News Slack Bot</title>
      </Head>
      <GithubCorner url="https://github.com/steven-tey/hacker-news-slack-bot" />

      <main className="flex flex-col space-y-5 items-center justify-center min-h-screen py-10 sm:pb-20">
        <div className="relative w-[422px] h-[66px] sm:w-[633px] sm:h-[100px]">
          <Image
            src={bannerImage}
            alt="Hacker News Slack Bot Banner"
            layout="fill"
          />
        </div>
        <div className="text-center max-w-md sm:max-w-lg space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Hacker News Slack Bot
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
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
            src={demoGif}
            alt="Hacker News Slack Bot Demo Gif"
            layout="fill"
            priority
          />
        </div>
        <div className="flex flex-col text-center space-y-2">
          <AddToSlack />
          <a
            href="https://github.com/steven-tey/hacker-news-slack-bot#deploy-your-own"
            className="text-gray-500 hover:text-black text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Looking to self-host instead?
          </a>
        </div>
      </main>
    </div>
  );
};

export default Home;
