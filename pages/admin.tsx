import Head from "next/head";
import GithubCorner from "@/components/github-corner";
import { useState } from "react";
import Image from "next/image";
import { getTeamsAndKeywords, redis } from "@/lib/upstash";
import ms from "ms";

const ListItem = ({
  teamId,
  signupTime,
  slackInfo,
  unfurls,
  notifications,
  keywords,
}: {
  teamId: string;
  signupTime: string;
  slackInfo: any | null;
  unfurls: number;
  notifications: number;
  keywords: string[];
}) => {
  const [expanded, setExpanded] = useState(false);
  const timeAgo = `${ms(Date.now() - JSON.parse(signupTime))} ago`;

  return (
    <li className="py-4 space-y-4">
      <div className="flex justify-between items-center space-x-4">
        <div className="space-y-3">
          <div className="flex space-x-5 items-center">
            <div className="flex-shrink-0">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={
                    slackInfo?.email_domain
                      ? `https://logo.clearbit.com/${
                          slackInfo.email_domain.split(",")[0]
                        }`
                      : `https://avatar.tobi.sh/${teamId}`
                  }
                  alt={teamId}
                  layout="fill"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {slackInfo ? slackInfo.name : teamId}
                <span className="font-normal text-gray-400 text-sm ml-3">
                  Joined {timeAgo}
                </span>
              </p>
              <p className="text-sm text-gray-500 truncate">{"@" + teamId}</p>
            </div>
          </div>
          {keywords.length > 0 && (
            <div className="flex-shrink-0 justify-start items-center space-y-2">
              {keywords
                .slice(0, expanded ? keywords.length : 6)
                .map((keyword) => (
                  <div
                    key={keyword}
                    className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-whit whitespace-nowrap mr-2"
                  >
                    {keyword}
                  </div>
                ))}
              {keywords.length > 6 && (
                <button
                  className="inline-flex items-center px-2.5 py-0.5 text-sm leading-5 font-medium rounded-full text-gray-600 hover:text-black whitespace-nowrap"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "Show less" : `Show ${keywords.length - 6} more`}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-row space-x-5">
          <div className="text-center">
            <p className="font-bold text-xl">
              {Intl.NumberFormat("en-us").format(unfurls)}
            </p>
            <p className="text-sm text-gray-500">unfurls</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-xl">
              {Intl.NumberFormat("en-us").format(notifications)}
            </p>
            <p className="text-sm text-gray-500">notifications</p>
          </div>
        </div>
      </div>
    </li>
  );
};

export default function Admin({
  data,
}: {
  data: {
    teamId: string;
    signupTime: string;
    slackInfo: any | null;
    tokenTtl: number;
    unfurls: number;
    notifications: number;
    keywords: string[];
  }[];
}) {
  return (
    <div>
      <Head>
        <title>Admin | Hacker News Slack Bot</title>
      </Head>
      <GithubCorner url="https://github.com/steven-tey/hacker-news-slack-bot" />

      <main className="flex flex-col space-y-5 items-center py-10">
        <div className="relative w-[422px] h-[66px] sm:w-[633px] sm:h-[100px]">
          <Image
            src="/banner.png"
            alt="Hacker News Slack Bot Banner"
            layout="fill"
          />
        </div>
        <div className="text-center max-w-md sm:max-w-lg space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Hacker News Slack Bot Usage
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Usage stats for teams that are using the hosted version of the
            Hacker News Slack Bot.
          </p>
        </div>

        <div className="max-w-screen-lg m-auto px-5 w-full">
          <ul role="list" className="divide-y divide-gray-200">
            {data
              .sort((a, b) =>
                JSON.parse(a.signupTime) > JSON.parse(b.signupTime) ? 1 : -1
              )
              .map((d) => (
                <ListItem key={d.teamId} {...d} />
              ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const allTeamsTokenKeys = (
    await redis.scan(0, {
      match: "*_token",
      count: 10000,
    })
  )[1];

  const teamsAndKeywords = await getTeamsAndKeywords();
  const signupTimes = await redis.zrange<string[]>("signupTimes", 0, -1, {
    withScores: true,
  });

  console.log(signupTimes);
  console.log(
    signupTimes.indexOf("T01MYQYNR96"),
    signupTimes[signupTimes.indexOf("T01MYQYNR96") + 1]
  );

  const data = await Promise.all(
    allTeamsTokenKeys.map(async (tokenKey) => {
      const teamId = tokenKey.replace("_token", "");
      const [token, unfurls, notifications] = await redis.mget(
        tokenKey,
        `${teamId}_unfurls`,
        `${teamId}_unfurls`
      );
      const slack = await fetch("https://slack.com/api/team.info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json());
      return {
        teamId,
        signupTime: JSON.stringify(
          signupTimes[signupTimes.indexOf(teamId) + 1]
        ),
        slackInfo: slack.ok ? slack.team : null,
        unfurls: unfurls || 0,
        notifications: notifications || 0,
        keywords: teamsAndKeywords[teamId] || [],
      };
    })
  );

  return {
    props: {
      data,
    },
    revalidate: 60,
  };
}
