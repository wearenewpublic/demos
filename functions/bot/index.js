const { HelpCommand } = require("./help");
const { ListCommand } = require("./list");
const { PingPongSlackbot, PingCommand, WibbleCommand } = require("./ping");

exports.bots = {
    pingpong: PingPongSlackbot
}

exports.commands = {
    ping: PingCommand,
    wibble: WibbleCommand,
    list: ListCommand,
    help: HelpCommand
}

