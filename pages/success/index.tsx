import Head from "next/head";
import SlackButton from "@/components/slack-button";
import Image from "next/image";
import GithubCorner from "@/components/github-corner";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

export default function SuccessTeam() {
  return (
    <div>
      <Head>
        <title>Installation Successful</title>
      </Head>
      <GithubCorner url="https://github.com/vercel-labs/hacker-news-slack-bot" />

      <main className="flex flex-col space-y-5 items-center justify-center min-h-screen max-h-screen py-10 sm:pb-20">
        <div className="relative w-[422px] h-[66px] sm:w-[633px] sm:h-[100px]">
          <Image
            src="/banner.png"
            alt="Hacker News Slack Bot Banner"
            layout="fill"
          />
        </div>
        <div className="text-center max-w-md sm:max-w-lg space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Installation Successful
          </h1>

          <p className="text-sm sm:text-base text-gray-600">
            You can now create a channel to receive notifications in and start
            configuring the bot with the{" "}
            <span className="font-mono text-red-700">/configure</span> command.
          </p>
        </div>

        <div
          className="relative w-full max-w-2xl border border-gray-200 drop-shadow-md 
         sm:rounded-lg overflow-hidden"
        >
          <LiteYouTubeEmbed
            id="gBCIaf200oQ"
            adNetwork={true}
            playlist={false}
            title="Hacker News Slack Bot Demo"
            noCookie={true}
            thumbnail="/screenshot.png"
            aspectHeight={10}
          />
        </div>
        <div className="flex flex-col text-center space-y-2">
          <SlackButton text="Open Slack" url="slack://slack.com/app_redirect" />
        </div>
      </main>
    </div>
  );
}
