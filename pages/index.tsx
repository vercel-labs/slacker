import type { NextPage } from "next";
import Head from "next/head";
import GithubCorner from "@/components/github-corner";
import SlackButton from "@/components/slack-button";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Hacker News Slack Bot</title>
      </Head>
      <GithubCorner url="https://github.com/steven-tey/hacker-news-slack-bot" />

      <main className="flex flex-col space-y-5 items-center justify-center min-h-screen py-10 sm:pb-20">
        <div className="relative w-[422px] h-[66px] sm:w-[633px] sm:h-[100px]">
          <Image
            src="/banner.png"
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

        <div
          className="relative w-full max-w-xl h-96 border-2 border-black 
         sm:rounded-lg overflow-hidden bg-no-repeat bg-center bg-cover
         bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAeCAYAAABe3VzdAAAAAXNSR0IArs4c6QAABZ9JREFUWEdtWO1u3DYQJKU7ue//Nv0RBGhRoEmT9k8a20idnGwn6UNEYrHzsaTORaDIPlPkaHZ2dvfqm7dvWyml1FrLVGup04Q7Piu1tII/l9YaL/2Mz/Q3rsUmwz0+4T5YyQfxs9fHmbjin87k2oa1ca/v3r8/AvRD+YDBCZBAjgANw4fwXgGYeHwo9+LLlDIJmIH2lxEZsfbD3x8auMJ+A3sCiJfWAfkzP+ps6ETuQWDgMvCBjH4g2BG3OG9S5A6E7KXtYvDh8wMBKsyknFsouMKiMMVvBscFJCvuU7zoxLABaAe473uJyzKJUwAOkiJQaQlr9sa19fnrM0MskKmjBGjVdG2IFp1ukKFfapgXdwyd7ntce9kAkvqKcwLUPM1lzvWMSqxpjS9Uv//7XQANMxWPTUwSiEO89lKCiV13aRKMBRvzjAsg8XxDuALctm06PHYVwJkA52AwSMQ5BAeAX799S4CMCvUoURZJuoc5gG1baXHtceDOTSOsAjfNpzLNZBKcmMFtA1DrMMILcPEc5MFMR4gN8LKusXdq0FZjsRNgZyJABcB9BCkh1jkYDHBxxaGTMlkhBoMdYOh1ngnSAJ1QWBcMfvrnUwME0TxN3tghogbxYGhj7+zFBricKTiIITZAhHlgBeudydBhPCOA6bc7k2Rvpd7d3TZkVLyJNg7hIjyHzQOcAIUOcSjDi/9sL8hIAh39bbSaNGtle2SxXQaaBRnK4rvbjw1VJMQ6n8p84t1mO+ohHoLmqCzy5qoz3LNC2G78hJjTr0MVkebTb+2bEeL7+w7wFKE5gUkfTIGH5pxZKlfJmMqVTDrzS+ZowzaoNE7nYZooTRO2ZDlFin55eABA1OCDdiIDqbsEGCIfanIypfrtSgLPHerywHeWuaz2rnvW3xWL9XG9QIM0zrAGpnyKQhZhkBuspTcOBplVITPSJS9e09W68+jKdWT2qizGez49rqrFDhWzFwyAdflSeNgms73yM2qYlgEtu5pI/MfKaLguqdIxKijLqRMFGn9cVzxhFkeBu11yokQl2LYfZftBH2TCNLZqBneihhkN9Cvd5BHrrE29KKh4jeD4Uq3U9XLJ/ueYfWEzWb/p7ABIkC8ASsPzCNAMChNLJfO/J9MxyGPPiWbhcvlyFWIVfPd0Eq9LD4G5ItAHwWB0JmLOZm+pMDtVxpwxrl6DVXkduxk2FXVVqUOQx3bpRT/HTgReKJd/Ybjo7dTJpPnaPhzdIcTK9KGZVqs1JOHT02OISOmvXi69Sd3FlbszcY5UoBrBrsiomw5LbhwVDkZt/cv82Y2pb4zoPD0/5StlorBEuMK+nEs0X4yF4dDwurPOCtIz9P8qUFqhWrr02gB4WUODQHQYeGjeHmpc3CLEQ+OQTLoUD8/04pq2cXih4SVyYJLFHADe39/m0MQs7sUe1mFdqvpyVrAe1WV7pnFF0Ys5lKMkAHJo7zwPdQeKBHFz3Er9688/oEHMBWgY5nI6nYfGIeqyzDvbpt5tHPSkGeM4pfXkGHVLgtWk5psMrZ1Mu/726+vGxnEup/O5nM9LOS835Xw+lxlA1b7bcMWgezrLdWx0rwGmzRwsbwR3nJ9hSh4lXr/6uQV7ALcs5ebmp7IEwOUGTGK+iNT0EC9/cgaxbFN7AHnVYnmo6eYixQ9jJtV/9aWAOpv6y+tXLTYPMMuylCUA3gSDC/vCac4B3GbL8hZTJgFRp56te/b3Lua6JRBjOeL2dM/u3Qy+e/N7Q7ufIT6DzXkme+wY9BWI7KVUTSoAJwaTuStdjRUkcR4BmkEu7T0hqtTdx1uchglLBb/PJRqYhm8HevNkkO79PKx3gGPoWIP9bU52g5oURg2qe5KF1XV9lM10JgaH1sDU264c2vmX/BbCneihG+rn9lYqv9t52Ykng/nNQin/AYuzc1t4U1BtAAAAAElFTkSuQmCC')]"
        >
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
        </div>
        <div className="flex flex-col text-center space-y-2">
          <SlackButton
            text="Add to Slack"
            url={`https://slack.com/oauth/v2/authorize?scope=chat:write,chat:write.public,links:read,links:write,commands,team:read&client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}`}
          />
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
}
