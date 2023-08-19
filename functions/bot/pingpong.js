const { App } = require('@slack/bolt');

// exports.PingPongSlackbot = new App({
//   token: process.env.SLACK_BOT_TOKEN, // Set your Bot User OAuth Token here
//   signingSecret: process.env.SLACK_SIGNING_SECRET // Set your Slack Signing Secret here
// });

// // Listen to messages containing "ping"
// app.message('ping', async ({ message, say }) => {
//   // Say "pong" in response to "ping"
//   await say('pong');
// });

// // Start the app
// (async () => {
//   await app.start();
//   console.log('⚡️ Bolt app is running!');
// })();

// const app = new App({
//   token: functions.config().slack.token,
//   signingSecret: functions.config().slack.signing_secret
// });

// // Listen to messages containing "ping"
// app.message('ping', async ({ message, say }) => {
//   // Say "pong" in response to "ping"
//   await say('pong');
// });