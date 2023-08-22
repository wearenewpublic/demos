const { BOTLAB_SLACK_APP_TOKEN: BOTLAB_APP_TOKEN, BOTLAB_SLACK_SECRET } = require("../keys");
const { ListCommand } = require("./list");
const { PingPongSlackbot, PingCommand, WibbleCommand } = require("./ping");

exports.bots = {
    pingpong: PingPongSlackbot
}

exports.commands = {
    ping: PingCommand,
    wibble: WibbleCommand,
    list: ListCommand
}
