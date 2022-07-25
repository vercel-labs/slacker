<p align="center">
    <img src="https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png" height="96">
    <h3 align="center">Hacker News Slack Bot</h3>
</p>

<p align="center">
  A bot that monitors Hacker News for mentions of certain keywords and sends it to Slack.
</p>

<div align="center">
  <a href="https://slack.com/oauth/v2/authorize?scope=chat:write,chat:write.public,links:read,links:write,commands&client_id=12364000946.3845028209600"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
</div>

<p align="center">
  <a href="#deploy-your-own"><strong><i>or deploy your own</i></strong></a>
</p>
<br/>

## Introduction

A bot that monitors Hacker News for mentions of certain keywords related to your company/product and sends it to a Slack channel.

It also unfurls & shows previews for `news.ycombinator.com` links sent in Slack.

![Hacker News Slack Bot Demo](https://user-images.githubusercontent.com/28986134/180668999-5ce216d7-00ef-4e9d-93cb-d24c3e532034.png)

## Stack

1. [Zeplo](https://www.zeplo.io/) for cron scheduling
2. [Vercel Functions](https://vercel.com/docs/concepts/functions) for [cron processes](https://github.com/vercel/hacker-news-slack-bot/blob/main/pages/api/cron.ts) & [event subscriptions via webhooks](https://github.com/vercel/hacker-news-slack-bot/blob/main/pages/api/event.ts)
3. [Hacker News API](https://github.com/HackerNews/API) for [pulling data](https://github.com/vercel/hacker-news-slack-bot/blob/main/lib/hn.ts)
4. [Slack API](https://api.slack.com/docs) for [sending](https://github.com/vercel/hacker-news-slack-bot/blob/main/lib/slack.ts#L48) and [unfurling]
(https://github.com/vercel/hacker-news-slack-bot/blob/main/lib/slack.ts#L74) messages
5. [Upstash](https://upstash.com/) for [key-value storage](https://github.com/vercel/hacker-news-slack-bot/blob/main/lib/upstash.ts)

## How It Works

![Hacker News Slack Bot Overview](https://user-images.githubusercontent.com/28986134/180705583-a52c3578-5df3-4576-8362-6d6e0b287ef2.png)

1. Set up a cron in Zeplo that pings our [`/api/cron` endpoint](https://github.com/vercel/hacker-news-slack-bot/blob/main/pages/api/cron.ts) once every 60 seconds.
2. Get the [`lastCheckedId`](https://github.com/vercel/hacker-news-slack-bot/blob/5c72371a8dca779f99b14d7b82fdb86e53fb49b6/lib/cron.ts#L10) last checked HN post ID and the list of `keywords` to check against from Upstash.
3. Get the `latestPostId` using HN API's [`maxitem`](https://github.com/HackerNews/API#max-item-id) endpoint. Then, perform checks against each post between `lastCheckedId` and `latestPostId` to see if they contain any of the delineated `keywords`.
4. For each positive post, send its link to Slack using the [`chat.postMessage` method](https://api.slack.com/methods/chat.postMessage).
5. Listed to the [`link_shared` event](https://api.slack.com/events/link_shared) at our `/api/event` endpoint. Once an event occurs, send a POST request to Slack to unfurl the link using the [chat.unfurl method](https://api.slack.com/methods/chat.unfurl).

## One-Click Install

You can click the button above to install the 

## Deploy your own
