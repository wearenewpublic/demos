const { callSlackAsync } = require("../component/slack");
const { getUserMappingAsync, replaceUserIdsWithNamesInMessages, filterBotlabMessages, removeNullMessageFields } = require("../botutil/users");
const { callGptAsync } = require("../component/chatgpt");
const { getTimeAgo } = require("../botutil/botutil");

const SummaryCommand = {
    description: 'Summarize recent channel activity in various ways',
    action: summaryAction,
    slow: true
}

async function summaryAction({args, channel}) {
    const [interval, ... describe] = args;
    const pUserMapping = getUserMappingAsync();
    const timeAgo = getTimeAgo({interval});
    const messagesResult = await callSlackAsync({action: 'conversations.history', data: {channel, limit: 50, oldest: timeAgo.toString()}});

    const userMapping = await pUserMapping;
    if (!userMapping) {
        return 'Error getting user list - likely rate limit exceeded';
    }
    const format = describe.join(' ').trim() || 'bulleted list';

    if (messagesResult.error) {
        console.log('messagesResult', messagesResult);
        return 'BotLab has not been invited into this channel';
    }

    const prettyMessages = replaceUserIdsWithNamesInMessages({messages: messagesResult.messages ?? [], userMapping});
    const filteredMessages = filterBotlabMessages({messages: prettyMessages});
    const cleanedMesasges = removeNullMessageFields({messages: filteredMessages});
    const agreePoints = await callGptAsync({promptKey: 'slack_summary', params: 
        {commentsJSON: JSON.stringify(cleanedMesasges), format}});

    return agreePoints.data;
}

exports.SummaryCommand = SummaryCommand;
