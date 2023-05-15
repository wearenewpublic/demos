import { getGlobalProperty, getObject } from "../util/localdata";
import { callServerApiAsync } from "../util/servercall";


export async function askGptToRespondToConversationAsync({promptKey, messages, newMessageText}) {
    const messagesText = messagesToGptString({messages, newMessageText});
    console.log('calling GPT', {promptKey, messagesText});
    const gptResponse = await callServerApiAsync('chatgpt', 'chat', {promptKey, messagesText});
    console.log('got GPT response', {gptResponse});
    return gptResponse.messageText || null;
}

export function askGptToEvaluateMessageTextAsync({text}) {

}

export function messagesToGptString({messages, newMessageText}) {
    const personaKey = getGlobalProperty('$personaKey');
    const allMessages = [...messages, {text: newMessageText, from: personaKey}];
    return allMessages.map(message => getObject('persona', message.from)?.name + ': ' + JSON.stringify(message.text)).join('\n\n');
}

