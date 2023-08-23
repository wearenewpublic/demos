const { callSlackAsync } = require("../component/slack");

function replaceUserMentions(text, userMapping) {
    return text.replace(/<@(\w+)>/g, (match, userId) => {
      return userMapping[userId] || match; // Use the original match if the user ID is not found in the mapping
    });
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

function replaceUserIdsWithNamesInMessages({messages, userMapping}) {
    const sortedMessages = messages.sort((a, b) => a.ts - b.ts);
    const namedMessages = sortedMessages.map(message => {
        const { user, text } = message;
        const name = userMapping[user];
        return { from: name, text: replaceUserMentions(text, userMapping) };
    })
    return namedMessages;
}

function filterBotlabMessages({messages}) {
    console.log('filter', messages);
    const filteredMessages = messages.filter(message => 
        !(message.from ?? '').includes('Botlab') && !(message.text ?? '').includes('Botlab'));
    return filteredMessages;
}


module.exports = {replaceUserMentions, getUserMappingAsync, replaceUserIdsWithNamesInMessages, filterBotlabMessages};



