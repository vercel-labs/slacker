import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import Image from "next/image";

const Home: NextPage = () => {
  const [clicked, setClicked] = useState(false);
  return (
    <div>
      <Head>
        <title>Hacker News Slack Bot</title>
        <meta
          name="description"
          content="A bot that monitors Hacker News for mentions of certain keywords and sends it to a Slack channel."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-3xl font-bold mb-5">Hacker News Bot</h1>
        <a
          href="https://slack.com/oauth/v2/authorize?scope=chat:write,links:read,links:write,commands&user_scope=links:read&client_id=12364000946.3845028209600"
          onClick={() => setClicked(true)}
          style={{
            fontFamily: "Lato, sans-serif",
            fontSize: "16px",
            fontWeight: "600",
          }}
          className="group inline-flex items-center justify-center rounded-md w-[236px] h-[48px] border border-gray-300 hover:border-black transition-all"
        >
          <div className="group-hover:block hidden relative w-10 h-10 -ml-2.5 mr-0.5">
            <Image
              src="/slackanimation.gif"
              alt="Slack logo animated"
              width={36}
              height={36}
              layout="fill"
            />
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{
              height: "20px",
              width: "20px",
              marginRight: "12px",
            }}
            className="group-hover:hidden block"
            viewBox="0 0 122.8 122.8"
          >
            <path
              d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
              fill="#e01e5a"
            ></path>
            <path
              d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
              fill="#36c5f0"
            ></path>
            <path
              d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
              fill="#2eb67d"
            ></path>
            <path
              d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
              fill="#ecb22e"
            ></path>
          </svg>
          Add to Slack
        </a>
      </main>
    </div>
  );
};

export default Home;
