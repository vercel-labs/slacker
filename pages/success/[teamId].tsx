import Head from "next/head";
import { ParsedUrlQuery } from "querystring";
import { GetStaticProps } from "next";
import SlackButton from "@/components/slack-button";

export default function SuccessTeam(props: { teamId: string }) {
  return (
    <div>
      <Head>
        <title>Installation Successful</title>
      </Head>

      <main className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-3xl font-bold">Installation Successful</h1>
        <SlackButton
          text="Open Slack"
          url={`slack://slack.com/app_redirect?app=${props.teamId}`}
        />
      </main>
    </div>
  );
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

interface Params extends ParsedUrlQuery {
  teamId: string;
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { teamId } = context.params as Params;
  return {
    props: { teamId },
  };
};
