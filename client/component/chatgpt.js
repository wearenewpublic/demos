import { getGlobalProperty, getObject } from "../util/localdata";
import { callServerApiAsync } from "../util/servercall";


export async function askGptToRespondToConversationAsync({promptKey, messages, newMessageText}) {
    const messagesText = messagesToGptString({messages, newMessageText});
    console.log('askGptToRespondToConversation', {promptKey, messagesText});
    const rawResponse = await callServerApiAsync('chatgpt', 'chat', {promptKey, messagesText});
    console.log('got GPT response', {rawResponse});
    const parsedResponse = JSON.parse(rawResponse);
    return parsedResponse.messageText || null;
}

export async function askGptToEvaluateMessageTextAsync({promptKey, text}) {
    console.log('askGptToEvaluateMessageText', {promptKey, text});
    const rawResponse = await callServerApiAsync('chatgpt', 'chat', {promptKey, messagesText:text});
    const lastLine = rawResponse.split('\n').pop();
    console.log('get GPT response', rawResponse, lastLine);
    const parsedResponse = JSON.parse(lastLine);
    return parsedResponse.judgement || false;

}

export function messagesToGptString({messages, newMessageText}) {
    const personaKey = getGlobalProperty('$personaKey');
    const allMessages = [...messages, {text: newMessageText, from: personaKey}];
    return allMessages.map(message => getObject('persona', message.from)?.name + ': ' + JSON.stringify(message.text)).join('\n\n');
}

