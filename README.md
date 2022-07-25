<p align="center">
    <img src="https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png" height="96">
    <h3 align="center">Hacker News Slack Bot</h3>
</p>

<p align="center">
  A bot that monitors Hacker News for mentions of certain keywords and sends it to Slack.
</p>

<div align="center">
  <a href="https://slack.com/oauth/v2/authorize?client_id=12364000946.3845028209600&scope=chat:write,commands,links:read&user_scope=links:read"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
</div>

<p align="center">
  <a href="#deploy-your-own"><strong><i>or deploy your own</i></strong></a>
</p>
<br/>

## Introduction

A bot that monitors Hacker News for mentions of certain keywords related to your company/product and sends it to a Slack channel. 

It also unfurls & shows previews for `news.ycombinator.com` links sent in Slack.

![CleanShot 2022-07-24 at 17 49 52](https://user-images.githubusercontent.com/28986134/180668999-5ce216d7-00ef-4e9d-93cb-d24c3e532034.png)

## How it works

1. [Slack API](https://api.slack.com/docs) for [sending](https://github.com/vercel/hacker-news-slack-bot/blob/main/lib/slack.ts#L48) and [unfurling](https://github.com/vercel/hacker-news-slack-bot/blob/main/lib/slack.ts#L74) messages
2. [Hacker News API](https://github.com/HackerNews/API) for [pulling data](https://github.com/vercel/hacker-news-slack-bot/blob/main/lib/hn.ts)
3. [Upstash](https://upstash.com/) for [key-value storage](https://github.com/vercel/hacker-news-slack-bot/blob/main/lib/upstash.ts)
4. [Vercel Functions](https://vercel.com/docs/concepts/functions) for [cron processes](https://github.com/vercel/hacker-news-slack-bot/blob/main/pages/api/cron.ts) & [event subscriptions via webhooks](https://github.com/vercel/hacker-news-slack-bot/blob/main/pages/api/unfurl.ts)
5. [Zeplo](https://www.zeplo.io/) for cron scheduling

## Installing in Slack

You can click the button above 

## Deploy your own
