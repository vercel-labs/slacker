import type { NextPage } from "next";
import Head from "next/head";

const Success: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Installation Successful</title>
        <meta
          name="description"
          content="A bot that monitors Hacker News for mentions of certain keywords and sends it to a Slack channel."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-3xl font-bold">Installation Successful</h1>
      </main>
    </div>
  );
};

export default Success;
