
const ListCommand = {
    description: 'List all commands',
    action: listAction   
}

function listAction() {
    console.log('list');

    const { commands } = require('../bot');
    const sortedCommands = Object.keys(commands).sort();
    const commandList = sortedCommands.map(key => {
        const { description } = commands[key];
        return `• *${key}*: ${description}`;
    });

    const blocks = [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": commandList.join('\n')            
          }
        }
      ];

    console.log('blocks', blocks);
      
    return blocks;
}

exports.ListCommand = ListCommand;


