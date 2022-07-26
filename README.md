<div align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/28986134/180941235-00044773-1b16-4984-9245-7a7d64a50219.png">
        <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/28986134/180941185-0bb5b912-1884-4da9-b36d-e49cd09d5198.png">
        <img alt="Banner" src="https://user-images.githubusercontent.com/28986134/180941185-0bb5b912-1884-4da9-b36d-e49cd09d5198.png">
    </picture>
    <h3 align="center">Hacker News Slack Bot</h3>
    <p>A bot that monitors Hacker News for mentions of certain keywords, sends them to Slack, and shows a link preview.</p>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/28986134/180941459-66936b53-c1d4-431f-b1b3-3e7295ad66b9.png">
        <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/28986134/180941553-b12e3a2b-10f3-4979-848b-4eb8d98cd580.png">
        <img alt="Demo" src="https://user-images.githubusercontent.com/28986134/180941553-b12e3a2b-10f3-4979-848b-4eb8d98cd580.png">
    </picture>
</div>

<div align="center">
  <a href="https://slack.com/oauth/v2/authorize?scope=chat:write,chat:write.public,links:read,links:write,commands,team:read&client_id=12364000946.3845028209600"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
</div>

<p align="center">
  <a href="#deploy-your-own"><strong><i>or deploy your own</i></strong></a>
</p>
<br/>

## Built With

1. [Zeplo](https://www.zeplo.io/) for cron scheduling
2. [Vercel Functions](https://vercel.com/docs/concepts/functions) for [cron processes](https://github.com/steven-tey/hacker-news-slack-bot/blob/main/pages/api/cron.ts) & [event subscriptions via webhooks](https://github.com/steven-tey/hacker-news-slack-bot/blob/main/pages/api/event.ts)
3. [Hacker News API](https://github.com/HackerNews/API) for [pulling data](https://github.com/steven-tey/hacker-news-slack-bot/blob/main/lib/hn.ts)
4. [Slack API](https://api.slack.com/docs) for [sending](https://github.com/steven-tey/hacker-news-slack-bot/blob/main/lib/slack.ts#L47) and [unfurling](https://github.com/steven-tey/hacker-news-slack-bot/blob/main/lib/slack.ts#L73) messages
5. [Upstash](https://upstash.com/) for [key-value storage](https://github.com/steven-tey/hacker-news-slack-bot/blob/main/lib/upstash.ts)

<br/>

## How It Works

1. Set up a cron in Zeplo that pings our [`/api/cron` endpoint](https://github.com/steven-tey/hacker-news-slack-bot/blob/main/pages/api/cron.ts) once every 60 seconds.
2. Get the last checked HN post ID ([`lastCheckedId`](https://github.com/steven-tey/hacker-news-slack-bot/blob/5c72371a8dca779f99b14d7b82fdb86e53fb49b6/lib/cron.ts#L10)) and the list of `keywords` to check against from Upstash.
3. Get the `latestPostId` using HN API's [`maxitem`](https://github.com/HackerNews/API#max-item-id) endpoint. Then, perform checks against each post between `lastCheckedId` and `latestPostId` to see if they contain any of the delineated `keywords`.
4. For each positive post, send its link to Slack using the [`chat.postMessage` method](https://api.slack.com/methods/chat.postMessage).
5. Listed to the [`link_shared` event](https://api.slack.com/events/link_shared) at our `/api/event` endpoint. Once an event occurs, send a POST request to Slack to unfurl the link using the [chat.unfurl method](https://api.slack.com/methods/chat.unfurl).

<picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/28986134/180942458-01c9233c-41dc-4d51-a3a6-c64fbe5e44fb.png">
        <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/28986134/180942414-dd69d83c-e37a-4833-877e-e60cccd85ecc.png">
        <img alt="Hacker News Slack Bot Overview" src="https://user-images.githubusercontent.com/28986134/180942414-dd69d83c-e37a-4833-877e-e60cccd85ecc.png">
    </picture>

## One-Click Install

You can click the button below to install the bot directly into your desired Slack workspace:

<a href="https://slack.com/oauth/v2/authorize?scope=chat:write,chat:write.public,links:read,links:write,commands,team:read&client_id=12364000946.3845028209600"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>

Once it's installed, here are a few [slash commands](https://api.slack.com/interactivity/slash-commands) you can use to set up the bot:

- `/channel <CHANNEL_ID>`: Set the desired channel for the bot to send notifications in.

  > Note: this is your unique channel ID (not your channel slug/name). Here's [how you can get your `CHANNEL_ID`](https://stackoverflow.com/questions/40940327/what-is-the-simplest-way-to-find-a-slack-team-id-and-a-channel-id).

- `/channel`: Check the currently set channel.
- `/list`: Show the current list of `keywords` that are being tracked
- `/track`: Add a keyword to track
- `/untrack`: Remove a keyword to track

## Deploy Your Own

You can also deploy your own version of this bot using Zeplo, Vercel, and Upstash.

### Step 1: Create Slack App + Secure Env Vars

1. Navigate to [api.slack.com/apps](https://api.slack.com/apps) and click on "Create New App".
2. Select "From scratch" and input `Hacker News Bot` as the name of your app.
3. Voilà! You've just created your Slack app. Here, you'll receive 3 values that will be used for your Vercel deployment in the next step:
   - **Client ID**: This is your App's unique public-facing ID that will be the value for the `NEXT_PUBLIC_SLACK_CLIENT_ID` env var.
   - **Signing Secret**: This is the signing secret used to validate that requests are genuinely coming from Slack. It will be the value for the `SLACK_SIGNING_SECRET` env var.
   - **Verification Token**: This is the verification token used to validate that requests are genuinely coming from Slack. It will be the value for the `SLACK_VERIFICATION_TOKEN` env var.

![CleanShot 2022-07-25 at 02 16 31](https://user-images.githubusercontent.com/28986134/180720201-816f985d-774b-41fe-8cf5-b87f730d77d2.png)

For added security, we recommmend you set up a `CRON_JOB_OAUTH_TOKEN` to secure your cron requests from Zeplo. You can generate a random token [here](https://generate-secret.vercel.app/). Save this token for now, you'll need it for Step 3 & Step 4.

### Step 2: Create Upstash Account

Go to [console.upstash.com](https://console.upstash.com/login) and create an account. You'll need it for the next step.

### Step 3: Deploy to Vercel

You can deploy your bot to Vercel with one-click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsteven-tey%2Fhacker-news-slack-bot&project-name=hacker-news-slack-bot&repository-name=hacker-news-slack-bot&env=NEXT_PUBLIC_SLACK_CLIENT_ID,SLACK_SIGNING_SECRET,SLACK_VERIFICATION_TOKEN,CRON_JOB_OAUTH_TOKEN&envDescription=Read%20more%20about%20the%20required%20env%20vars%20here%3A&envLink=https%3A%2F%2Fgithub.com%2F%2Fhacker-news-slack-bot%23deploy-your-own&demo-title=Hacker%20News%20Slack%20Bot&demo-description=A%20bot%20that%20monitors%20Hacker%20News%20for%20mentions%20of%20certain%20keywords%20and%20sends%20it%20to%20a%20Slack%20channel.&demo-url=https%3A%2F%2Fhn-slack-bot.vercel.app%2F&demo-image=https%3A%2F%2Fhn-slack-bot.vercel.app%2Fthumbnail.png&integration-ids=oac_V3R1GIpkoJorr6fqyiwdhl17)

Be sure to include all 4 of the env vars above in your deployment.

When the project finishes deploying, get your project's domain (e.g. `https://hacker-news-slack-bot-eight.vercel.app/`). You'll need it for the next step.

### Step 4: Configuring Slack app

For your Slack app to be able to send/unfurl messages in your Slack workspace, we will need to configure a few things:

#### Step 4A: Configuring OAuth Scopes

1. From your Slack app home screen, select "OAuth & Permissions" from the sidebar (under "Features").
2. Scroll down to "Scopes", and add the following scopes under "Bot Token Scopes":

   - `chat:write`
   - `chat:write.public`
   - `links:read`
   - `links:write`

   ![CleanShot 2022-07-25 at 13 49 18](https://user-images.githubusercontent.com/28986134/180852042-653ed883-1cb6-45fd-bb6b-1969fb3ea705.png)

#### Step 4B: Configuring Event Subscriptions

1. Now, select "Event Subscriptions" from the sidebar (under "Features").
2. Toggle "Enable Events" to "ON".
3. For the "Request URL" field, input your Vercel project's domain and append `/api/event` to it. The final URL should look something like `https://hacker-news-slack-bot-eight.vercel.app//api/event`.
4. Scroll down to "Subscribe to bot events". Add the `link_shared` bot user event.
5. Do the same for `Subscribe to events on behalf of users".
   ![Slack app configurations (1)](https://user-images.githubusercontent.com/28986134/180888217-911be4f9-be58-4f1c-a0bf-db915bbcb006.png)
6. Under "App unfurl domains", add `news.ycombinator.com`.
   ![Slack app configurations](https://user-images.githubusercontent.com/28986134/180942661-8c3821c5-d841-4d0c-b6a9-3e88e11baed7.png)
7. Click on "Save Changes".

#### Step 4C: Configure Slash Commands

Select "Slash Commands" from the sidebar (under "Features"). Create the following commmands with their respective Request URLs (based on your Vercel project's domain):

1. Channel
   - Command: `/channel`
   - Request URL: `https://[YOUR_VERCEL_PROJECT_DOMAIN]/api/cmd/channel`
   - Short Description: Set the desired channel for the bot to send notifications in.
2. List
   - Command: `/list`
   - Request URL: `https://[YOUR_VERCEL_PROJECT_DOMAIN]/api/cmd/list`
   - Short Description: Show the current list of keywords that are being tracked
3. Track
   - Command: `/track`
   - Request URL: `https://[YOUR_VERCEL_PROJECT_DOMAIN]/api/cmd/track`
   - Short Description: Add a keyword to track
4. Untrack
   - Command: `/untrack`
   - Request URL: `https://[YOUR_VERCEL_PROJECT_DOMAIN]/api/cmd/untrack`
   - Short Description: Remove a keyword to track

#### Step 4D: Install App to Slack Workspace + Get OAuth token

1. Go to "Basic Information" (under "Settings").
2. Under "Install your app", click opn "Install to Workspace".
3. You should receive a notification that your app has been installed in your Slack workspace.
4. Go back to "OAuth & Permissions". Copy the value of "Bot User OAuth Token".
   ![CleanShot 2022-07-25 at 18 28 46](https://user-images.githubusercontent.com/28986134/180891662-32c45dd7-18a1-4dd1-a729-e652bbdd42d6.png)
5. Set it as the `SLACK_OAUTH_TOKEN` env var in your Vercel project. Here's a [guide](https://vercel.com/docs/concepts/projects/environment-variables) on how to do that.
   <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/28986134/180943047-59b23db2-affe-4a14-acc6-076244f68f06.png">
   <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/28986134/180892017-510b87b6-5bc9-4262-ab10-32e5f7887ef9.png">
   <img alt="Add env var" src="https://user-images.githubusercontent.com/28986134/180892017-510b87b6-5bc9-4262-ab10-32e5f7887ef9.png">
   </picture>
6. Redeploy your Vercel project for the changes to take effect.
7. To verify that this worked, go to any channel on your Slack workspace and send a Hacker News link. The link should now unfurl and show a nice preview (like the one above).

### Step 5: Set Up Cron Processes on Zeplo

1. Create an account on [Zeplo](https://www.zeplo.io/).
2. Go to "Schedules", and click on "Create Schedule".
3. Configure the URL as `https://[YOUR_VERCEL_PROJECT_DOMAIN]/api/cron`.
4. Select the POST method.
5. Under "Headers", click "Add new header", and input `Authorization`: `Bearer [CRON_JOB_OAUTH_TOKEN]` where the `CRON_JOB_OAUTH_TOKEN` is the one you got from Step 1.
6. Click "Schedule".
7. You should now start receiving notifications whenever your keywords are mentioned on Hacker News.

<br/>

## Authors

This project was originally created by [Steven Tey](https://twitter.com/steventey) at [Vercel](https://vercel.com/), with contributions/feedback from:

- Guillermo Rauch ([@rauchg](https://twitter.com/rauchg)) – [Vercel](https://vercel.com)
- Justin Ridgewell ([@jridgewell](https://github.com/jridgewell)) – [Vercel](https://vercel.com)
- Andrew Healey ([@healeycodes](https://github.com/healeycodes)) – [Vercel](https://vercel.com)
- Drew Bredvick ([@dbredvick](https://twitter.com/dbredvick)) – [Vercel](https://vercel.com)

<br/>

## License

The MIT License.

<br/>

<a aria-label="Vercel logo" href="https://vercel.com">
  <img src="https://badgen.net/badge/icon/Made%20by%20Vercel?icon=zeit&label&color=black&labelColor=black">
</a>
