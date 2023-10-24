const { HelpCommand } = require("./help");
const { ListCommand } = require("./list");
const { SummaryCommand } = require("./summary");
const { PingPongSlackbot, PingCommand, WibbleCommand } = require("./ping");
const { MirrorChannelCommand, MirrorUsersCommand, MirrorEmbeddingsCommand } = require("./mirror");

exports.bots = {
    pingpong: PingPongSlackbot
}

exports.commands = {
    ping: PingCommand,
    wibble: WibbleCommand,
    list: ListCommand,
    help: HelpCommand,
    summary: SummaryCommand,
    mirrorusers: MirrorUsersCommand,
    mirrorchannel: MirrorChannelCommand,
    mirrorembeddings: MirrorEmbeddingsCommand
}


