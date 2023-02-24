<div align="center">
    <img alt="Slacker OG Image" src="https://slacker.run/api/og?latest">
    <h3 align="center">Slacker</h3>
    <p>A bot that notifies you on Slack whenever your company/product is mentioned on Hacker News.</p>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/28986134/182243546-7687d077-280e-4c13-b96b-c6639c2a9e8e.png">
        <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/28986134/182243511-a118223b-ebe2-4a07-a3d1-58d4a88d541e.png">
        <img alt="Demo" src="https://user-images.githubusercontent.com/28986134/182243511-a118223b-ebe2-4a07-a3d1-58d4a88d541e.png">
    </picture>
</div>

<div align="center">
  <a href="https://slack.com/oauth/v2/authorize?scope=chat:write,chat:write.public,links:read,links:write,commands,team:read&client_id=12364000946.3845028209600"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack@2x.png" /></a>
</div>

<p align="center">
  <a href="#deploy-your-own"><strong><i>or deploy your own</i></strong></a>
</p>
<br/>

## Built With

1. [Vercel Functions](https://vercel.com/docs/concepts/functions) for [cron processes](https://github.com/vercel-labs/slacker/blob/main/pages/api/cron/index.ts) & [event subscriptions via webhooks](https://github.com/vercel-labs/slacker/blob/main/pages/api/event.ts)
2. [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) for triggering cron processes.
3. [Hacker News API](https://github.com/HackerNews/API) for [pulling data](https://github.com/vercel-labs/slacker/blob/main/lib/hn.ts)
4. [Slack API](https://api.slack.com/docs) for [sending](https://github.com/vercel-labs/slacker/blob/main/lib/slack.ts#L47) and [unfurling](https://github.com/vercel-labs/slacker/blob/main/lib/slack.ts#L73) messages
5. [Upstash](https://upstash.com) for key-value storage ([Redis](https://upstash.com/redis)).

<br/>

## How It Works

1. Set up a [Vercel cron job](https://vercel.com/docs/cron-jobs) that pings our [`/api/cron` endpoint](https://github.com/vercel-labs/slacker/blob/main/pages/api/cron/index.ts) once every 60 seconds.
2. Get the last checked HN post ID ([`lastCheckedId`](https://github.com/vercel-labs/slacker/blob/main/lib/cron.ts#L11)) and the list of `keywords` to check against from Upstash.
3. Get the `latestPostId` using HN API's [`maxitem`](https://github.com/HackerNews/API#max-item-id) endpoint. Then, perform checks against each post between `lastCheckedId` and `latestPostId` to see if they contain any of the delineated `keywords`.
4. For each positive post, send its link to Slack using the [`chat.postMessage` method](https://api.slack.com/methods/chat.postMessage).
5. Listen to the [`link_shared` event](https://api.slack.com/events/link_shared) at our `/api/event` endpoint. Once an event occurs, send a POST request to Slack to unfurl the link using the [chat.unfurl method](https://api.slack.com/methods/chat.unfurl).

<picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/28986134/221011048-524226f6-b9aa-4f64-b39e-70267ed8eb37.png">
   <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/28986134/221011121-c6f368b6-cbff-4b67-a0ee-ffc7986d9add.png">
   <img alt="Slacker Overview" src="https://user-images.githubusercontent.com/28986134/221011121-c6f368b6-cbff-4b67-a0ee-ffc7986d9add.png">
</picture>

## One-Click Install

> Here's a [60s video](https://user-images.githubusercontent.com/28986134/221060512-df024fa3-594e-4e09-9d1e-656fae85f5c3.mp4) that walks you through the installation process, step-by-step.

You can click the button below to install the bot directly into your desired Slack workspace:

<a href="https://slack.com/oauth/v2/authorize?scope=chat:write,chat:write.public,links:read,links:write,commands,team:read&client_id=12364000946.3845028209600"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack@2x.png" /></a>

Once it's installed, create a channel to receive notifications in and start configuring the bot with the `/configure` command.

<br/>

## Deploy Your Own

You can also deploy your own version of this bot using Vercel and Upstash. Note that while this is in early-access, some of these processes might change.

> Prefer a video tutorial instead? Watch this [video](https://youtu.be/_F4VuVKJn0Q).

### Step 1: Create Slack App + Secure Env Vars

1. Navigate to [api.slack.com/apps](https://api.slack.com/apps) and click on "Create New App".
2. Select "From scratch" and input `Hacker News Bot` as the name of your app.
3. Voilà! You've just created your Slack app. Here, you'll receive 3 values that will be used for your Vercel deployment in the next step:
   - **Client ID**: This is your App's unique public-facing ID that will be the value for the `NEXT_PUBLIC_SLACK_CLIENT_ID` env var.
   - **Signing Secret**: This is the signing secret used to validate that requests are genuinely coming from Slack. It will be the value for the `SLACK_SIGNING_SECRET` env var.
   - **Verification Token**: This is the verification token used to validate that requests are genuinely coming from Slack. It will be the value for the `SLACK_VERIFICATION_TOKEN` env var.

![CleanShot 2022-07-25 at 02 16 31](https://user-images.githubusercontent.com/28986134/180720201-816f985d-774b-41fe-8cf5-b87f730d77d2.png)

### Step 2: Create Upstash Account

Go to [console.upstash.com](https://console.upstash.com/login) and create an account. You'll need it for the next step.

### Step 3: Deploy to Vercel

You can deploy your bot to Vercel with one-click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fslacker&project-name=slacker&repository-name=slacker&env=NEXT_PUBLIC_SLACK_CLIENT_ID,SLACK_SIGNING_SECRET,SLACK_VERIFICATION_TOKEN&envDescription=Read%20more%20about%20the%20required%20env%20vars%20here%3A&envLink=https%3A%2F%2Fgithub.com%2F%2Fslacker%23deploy-your-own&demo-title=Hacker%20News%20Slack%20Bot&demo-description=A%20bot%20that%20monitors%20Hacker%20News%20for%20mentions%20of%20certain%20keywords%20and%20sends%20it%20to%20a%20Slack%20channel.&demo-url=https%3A%2F%2Fhn-slack-bot.vercel.app%2F&demo-image=https%3A%2F%2Fhn-slack-bot.vercel.app%2Fthumbnail.png&integration-ids=oac_V3R1GIpkoJorr6fqyiwdhl17)

Be sure to include all 5 of the env vars above in your deployment.

When the project finishes deploying, get your project's domain (e.g. `https://slacker-eight.vercel.app/`). You'll need it for the next step.

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
3. For the "Request URL" field, input your Vercel project's domain and append `/api/event` to it. The final URL should look something like `https://slacker-eight.vercel.app/api/event`.
4. Scroll down to "Subscribe to bot events". Add the `link_shared` bot user event.
5. Do the same for `Subscribe to events on behalf of users".
   ![Slack app configurations (1)](https://user-images.githubusercontent.com/28986134/180888217-911be4f9-be58-4f1c-a0bf-db915bbcb006.png)
6. Under "App unfurl domains", add `news.ycombinator.com`.
   ![Slack app configurations](https://user-images.githubusercontent.com/28986134/180942661-8c3821c5-d841-4d0c-b6a9-3e88e11baed7.png)
7. Click on "Save Changes".

#### Step 4C: Configure Slash Commands

Select "Slash Commands" from the sidebar (under "Features"). Create the following commmand with its respective Request URLs (based on your Vercel project's domain):

- Command: `/configure`
- Request URL: `https://[YOUR_VERCEL_PROJECT_DOMAIN]/api/cmd/configure`
- Short Description: Configure your HN Slack Bot

#### Step 4D: Enable Interactivity

1. Now, select "Interactivity & Shortcuts" from the sidebar (under "Features").
2. Toggle "Interactivity" to "ON".
3. For the "Request URL" field, input your Vercel project's domain and append `/api/response` to it. The final URL should look something like `https://slacker-eight.vercel.app/api/response`.
4. Click on "Save Changes".

#### Step 4E: Install App to Slack Workspace + Get OAuth token

1. Go to "Basic Information" (under "Settings").
2. Under "Install your app", click on "Install to Workspace".
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

<br/>

## Authors

This project was originally created by [Steven Tey](https://twitter.com/steventey) at [Vercel](https://vercel.com/), with contributions/feedback from:

- Guillermo Rauch ([@rauchg](https://twitter.com/rauchg)) – [Vercel](https://vercel.com)
- Justin Ridgewell ([@jridgewell](https://github.com/jridgewell)) – [Vercel](https://vercel.com)
- Andrew Healey ([@healeycodes](https://github.com/healeycodes)) – [Vercel](https://vercel.com)
- Drew Bredvick ([@dbredvick](https://twitter.com/dbredvick)) – [Vercel](https://vercel.com)
- Lee Robinson ([@leeerob](https://twitter.com/leeerob)) – [Vercel](https://vercel.com)
- Andreas Thomas ([@chronarkdotdev](https://twitter.com/chronarkdotdev)) – [Upstash](https://upstash.com)

<br/>

## License

The MIT License.

<br/>

<a aria-label="Vercel logo" href="https://vercel.com">
  <img src="https://badgen.net/badge/icon/Made%20by%20Vercel?icon=zeit&label&color=black&labelColor=black">
</a>
