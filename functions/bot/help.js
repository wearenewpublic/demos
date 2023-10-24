const HelpCommand = {
    description: 'Show help',
    action: helpAction
}

function helpAction() {
    const helpList = [
        "Botlab lets you try out lots of the bot ideas we have at New Public.",
        "Invoke a botlab command by mentioning the botlab app and the command name, like this:",
        "@Botlab list",
        "",
        "You can also invoke a command privately using a slash command, like this:",
        "/botlab list",
        "",
        "Use the list command to list all available commands.",
    ]

    const blocks = [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": helpList.join('\n')            
          }
        }
    ];

    return blocks;
}

exports.HelpCommand = HelpCommand;
