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
2. Get the last checked HN post ID ([`lastCheckedId`](https://github.com/vercel/hacker-news-slack-bot/blob/5c72371a8dca779f99b14d7b82fdb86e53fb49b6/lib/cron.ts#L10)) and the list of `keywords` to check against from Upstash.
3. Get the `latestPostId` using HN API's [`maxitem`](https://github.com/HackerNews/API#max-item-id) endpoint. Then, perform checks against each post between `lastCheckedId` and `latestPostId` to see if they contain any of the delineated `keywords`.
4. For each positive post, send its link to Slack using the [`chat.postMessage` method](https://api.slack.com/methods/chat.postMessage).
5. Listed to the [`link_shared` event](https://api.slack.com/events/link_shared) at our `/api/event` endpoint. Once an event occurs, send a POST request to Slack to unfurl the link using the [chat.unfurl method](https://api.slack.com/methods/chat.unfurl).

## One-Click Install

You can click the button below to install the bot directly into your desired Slack workspace:

<a href="https://slack.com/oauth/v2/authorize?scope=chat:write,chat:write.public,links:read,links:write,commands&client_id=12364000946.3845028209600"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>

Once it's installed, here are a few [slash commands](https://api.slack.com/interactivity/slash-commands) you can use to set up the bot:
- `/channel`: Set the desired channel for the bot to send notifications in. You can also check the currently set channel with `/channel`.
   ![CleanShot 2022-07-25 at 00 44 18](https://user-images.githubusercontent.com/28986134/180706428-6052778f-2fba-4e8f-9a78-5035388544cc.png)
   ![CleanShot 2022-07-25 at 00 45 42](https://user-images.githubusercontent.com/28986134/180706608-b8bcfc2d-f060-4912-bb84-4093302a804f.png)
- `/list`: Show the current list of `keywords` that are being tracked
   ![CleanShot 2022-07-25 at 00 52 01](https://user-images.githubusercontent.com/28986134/180707350-82d7b7b2-03a0-4c08-94a6-d57e6faa3ba0.png)
- `/track`: Add a keyword to track
   ![CleanShot 2022-07-25 at 00 49 40](https://user-images.githubusercontent.com/28986134/180707031-139de70e-43ac-434a-8ab4-bc26bbb2f1bf.png)
- `/untrack`: Remove a keyword to track
   ![CleanShot 2022-07-25 at 00 50 16](https://user-images.githubusercontent.com/28986134/180707134-98ddac64-e83c-4de1-8411-d0338e14f152.png)

## Deploy your own

You can also deploy your own version of this bot using Zeplo, Vercel, and Upstash.

### Step 1: Create Slack App + Securing Env Vars
1. Navigate to [api.slack.com/apps](https://api.slack.com/apps) and click on "Create New App".
2. Select "From scratch" and input `Hacker News Bot` as the name of your app.
3. Voilà! You've just created your Slack app. Here, you'll receive two env vars that will be used in the code to verify requests from Slack:
   - `SLACK_SIGNING_SECRET`: this is the value of "Signing Secret" in the screenshot below
   - `SLACK_VERIFICATION_TOKEN`: this is the value of "Verification Token" in the screenshot below

![CleanShot 2022-07-25 at 02 16 31](https://user-images.githubusercontent.com/28986134/180720201-816f985d-774b-41fe-8cf5-b87f730d77d2.png)

For added security, we recommmend you set up a `CRON_JOB_OAUTH_TOKEN` to secure your cron requests from Zeplo. You can generate a random token [here](https://generate-secret.vercel.app/).

### Step 2: Deploy to Vercel

You can deploy your bot to Vercel with one-click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fhacker-news-slack-bot&project-name=hacker-news-slack-bot&repository-name=hacker-news-slack-bot&env=CRON_JOB_OAUTH_TOKEN,SLACK_SIGNING_SECRET,SLACK_VERIFICATION_TOKEN&envDescription=Read%20more%20about%20the%20required%20env%20vars%20here%3A&envLink=https%3A%2F%2Fgithub.com%2Fvercel%2Fhacker-news-slack-bot%23deploy-your-own&demo-title=Hacker%20News%20Slack%20Bot&demo-description=A%20bot%20that%20monitors%20Hacker%20News%20for%20mentions%20of%20certain%20keywords%20and%20sends%20it%20to%20a%20Slack%20channel.&demo-url=https%3A%2F%2Fhn-bot.vercel.app%2F&demo-image=https%3A%2F%2Fhn-bot.vercel.app%2Fthumbnail.png&integration-ids=oac_V3R1GIpkoJorr6fqyiwdhl17)

Be sure to include all 3 of the env vars above in your deployment.

When the project finishes deploying, get the deployed URL for the project (e.g. `https://hacker-news-slack-bot-zeta.vercel.app/`). You'll need it for the next step.

### Step 3: Configuring Slack app

For your Slack app to be able to send/unfurl messages in your Slack workspace, we will need to configure a few things:

#### Step 3A: Configuring OAuth Scopes
1. From your Slack app home screen, select "OAuth & Permissions" from the sidebar (under "Features").
2. Scroll down to "Scopes", and add the following scopes under "Bot Token Scopes":
   - `chat:write`
   - `chat:write.public`
   - `links:read`
   - `links:write`
   
   ![CleanShot 2022-07-25 at 13 49 18](https://user-images.githubusercontent.com/28986134/180852042-653ed883-1cb6-45fd-bb6b-1969fb3ea705.png)

#### Step 3B: Configuring Event Subscriptions
1. Now, select "Event Subscriptions" from the sidebar (under "Features").
2. Toggle "Enable Events" to "ON".
3. For the "Request URL" field, input the deployment URL you got from Vercel and append `/api/event` to it. The final URL should look something like `https://hacker-news-slack-bot-zeta.vercel.app/api/event`.
4. Scroll down to "Subscribe to bot events". Add the `link_shared` bot user event. 
5. Do the same for `Subscribe to events on behalf of users".
   ![Slack app configurations (1)](https://user-images.githubusercontent.com/28986134/180888217-911be4f9-be58-4f1c-a0bf-db915bbcb006.png)
6. Under "App unfurl domains", add `news.ycombinator.com`. 
   ![Slack app configurations (2)](https://user-images.githubusercontent.com/28986134/180888572-5c682596-acab-447c-a150-8f69e922507b.png)
7. Click on "Save Changes".

#### Step 3C: Configure Slash Commands

Select "Slash Commands" from the sidebar (under "Features"). Create the following commmands with their respective Request URLs (based on your deploy URL:
1. Channel
    - Command: `/channel`
    - Request URL: `https://[YOUR_DEPLOY_URL]/api/cmd/channel`
    - Short Description: Set the desired channel for the bot to send notifications in.
2. List
    - Command: `/list`
    - Request URL: `https://[YOUR_DEPLOY_URL]/api/cmd/list`
    - Short Description: Show the current list of keywords that are being tracked
3. Track
    - Command: `/track`
    - Request URL: `https://[YOUR_DEPLOY_URL]/api/cmd/track`
    - Short Description: Add a keyword to track
4. Untrack
    - Command: `/untrack`
    - Request URL: `https://[YOUR_DEPLOY_URL]/api/cmd/untrack`
    - Short Description: Remove a keyword to track

#### Step 3D: Install App to Slack Workspace + Get OAuth token

1. Go back to "Basic Information" (under "Settings"). 
2. Under "Install your app", click opn "Install to Workspace".
3. You should receive a notification that your app has been installed in your Slack workspace.
4. Go to "OAuth & Permissions" under "Features". Copy the value of "Bot User OAuth Token".
   ![CleanShot 2022-07-25 at 18 28 46](https://user-images.githubusercontent.com/28986134/180891662-32c45dd7-18a1-4dd1-a729-e652bbdd42d6.png)
5. Set it as the `SLACK_OAUTH_TOKEN` env var in your Vercel project. Here's a [guide](https://vercel.com/docs/concepts/projects/environment-variables) on how to do that.
   ![CleanShot 2022-07-25 at 18 33 05](https://user-images.githubusercontent.com/28986134/180892017-510b87b6-5bc9-4262-ab10-32e5f7887ef9.png)
6. Redeploy your Vercel project for the changes to take effect.

### Step 4: Set Up Cron Processes on Zeplo

### Step 5: Delete Unnecessary Code
