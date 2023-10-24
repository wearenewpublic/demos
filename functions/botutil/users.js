const { callSlackAsync } = require("../component/slack");
const { omitNullAndUndefined } = require("./botutil");

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
        console.error('Error getting user list', users.error);
        return null;
    }
    users.members.forEach(user => {
        mapping[user.id] = user.profile?.display_name || user.real_name || user.name;
    })
    return mapping;
}

function simplifyMessageReplyLinks({messages}) {
    var hasReply = {};
    var nextMessageName = 0;
    var newMessageName = {};
    messages.forEach(message => {
        if (message.thread_ts) {
            hasReply[message.thread_ts] = true;
        }
    })
    Object.keys(hasReply).forEach(thread_ts => {
        newMessageName[thread_ts] = nextMessageName++;
    })
    const newMessages = messages.map(message => {
        const inThread = message.thread_ts ? newMessageName[message.thread_ts] : undefined;
        const key = hasReply(message.ts) ? newMessageName[message.ts] : undefined;
        return {key, inThread, ...message};
    });
}


function replaceUserIdsWithNamesInMessages({messages, userMapping}) {
    const sortedMessages = messages.sort((a, b) => a.ts - b.ts);
    const namedMessages = sortedMessages.map(message => {
        const { user, text } = message;
        const name = userMapping[user];
        return { from: name, text: replaceUserMentions(text, userMapping), key: message.key, inThread: message.inThread};
    })
    return namedMessages;
}

function removeNullMessageFields({messages}) {
    return messages.map(message => omitNullAndUndefined(message));
}

function filterBotlabMessages({messages}) {
    // console.log('filter', messages);
    const filteredMessages = messages.filter(message => 
        !(message.from ?? '').includes('Botlab') && !(message.text ?? '').includes('Botlab'));
    return filteredMessages;
}


module.exports = {replaceUserMentions, getUserMappingAsync, replaceUserIdsWithNamesInMessages, filterBotlabMessages, removeNullMessageFields};



