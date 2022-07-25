import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Head>
        <meta
          name="description"
          content="A bot that monitors Hacker News for mentions of certain keywords and sends it to a Slack channel."
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />
        <meta name="theme-color" content="#7b46f6" />

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="hacker news, slack, bot" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta itemProp="image" content="/thumbnail.png" />
        <meta property="og:image" content="/thumbnail.png" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@vercel" />
        <meta name="twitter:creator" content="@steventey" />
        <meta name="twitter:title" content="Hacker News Slack Bot" />
        <meta
          name="twitter:description"
          content="A bot that monitors Hacker News for mentions of certain keywords and sends it to a Slack channel."
        />
        <meta name="twitter:image" content="/thumbnail.png" />
      </Head>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
