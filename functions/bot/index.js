const { BOTLAB_SLACK_APP_TOKEN: BOTLAB_APP_TOKEN, BOTLAB_SLACK_SECRET } = require("../keys");
const { PingPongSlackbot } = require("./pingpong");

exports.bots = {
    pingpong: PingPongSlackbot
}

