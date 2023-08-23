const { callSlackAsync } = require("../component/slack");

const SummaryCommand = {
    description: 'Summarize recent channel activity in various ways',
    action: summaryAction
}

async function getUserMappingAsync() {
    const users = await callSlackAsync({action: 'users.list'});
    var mapping = {};
    if (!users.members || users.error) { 
        console.log('users', users);
        return {};
    }
    users.members.forEach(user => {
        mapping[user.id] = user.profile?.display_name || user.real_name || user.name;
    })
    return mapping;
}

function processMessages({messages, userMapping}) {
    const sortedMessages = messages.sort((a, b) => a.ts - b.ts);
    const namedMessages = sortedMessages.map(message => {
        const { user, text } = message;
        const name = userMapping[user];
        return { name, text };
    })
    return namedMessages;
}


async function summaryAction({args, channel}) {
    const pUserMapping = getUserMappingAsync();
    // const pUsers = await callSlackAsync({action: 'users.list'});
    const messagesResult = await callSlackAsync({action: 'conversations.history', data: {channel, limit: 50}});
    const userMapping = await pUserMapping;

    if (messagesResult.error) {
        console.log('messagesResult', messagesResult);
        return 'BotLab has not been invited into this channel';
    }

    const processedMessages = processMessages({messages: messagesResult.messages ?? [], userMapping});

    console.log('userMapping', userMapping);
    console.log('processed Messages', processedMessages);

    return 'summary';
}

exports.SummaryCommand = SummaryCommand;
