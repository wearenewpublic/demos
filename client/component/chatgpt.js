import { callServerApiAsync } from "../util/servercall";
const JSON5 = require('json5');


export async function askGptToRespondToConversationAsync({datastore, promptKey, messages, newMessageText}) {
    const messagesText = messagesToGptString({datastore, messages, newMessageText});
    const response = await gptProcessAsync({promptKey, params: {messagesText}});
    return response?.messageText || null;
}

export async function askGptToEvaluateMessageTextAsync({datastore, promptKey, text, params={}}) {
    const response = await gptProcessAsync({datastore, promptKey, params: {...params, text}});
    return response?.judgement || false;
}

export async function askGptToEvaluateConversationAsync({datastore, promptKey, messages, newMessageText, startPost}) {
    const messagesText = messagesToGptString({datastore, messages, newMessageText, startPost});
    const response = await gptProcessAsync({promptKey, params: {messagesText}});
    return response?.judgement || null;
}

export async function gptProcessAsync({datastore, promptKey, params}) {
    console.log('gptProcess', {promptKey, params});
    const rawResponse = await callServerApiAsync({datastore, component:'chatgpt', funcname:'chat', params:{promptKey, params}});
    console.log('get gpt raw response', rawResponse);
    const parsedResponse = extractAndParseJSON(rawResponse);
    console.log('get gpt response', parsedResponse);
    return parsedResponse;
}


export function messagesToGptString({datastore, messages, newMessageText, startPost}) {
    const personaKey = datastore.getPersonaKey();
    if (startPost) {
        messages = [startPost, ...messages];
    }
    const allMessages = [...messages, {text: newMessageText, from: personaKey}];
    return allMessages.map(message => datastore.getObject('persona', message.from)?.name + ': ' + JSON.stringify(message.text)).join('\n\n');
}


function extractAndParseJSON(text) {
    // Find JSON pattern using regular expression
    const jsonPattern = /{[^{}]*}|(\[[^\[\]]*\])/g;

    // Extract JSON from the text
    const jsonMatch = text.match(jsonPattern);
    
    // If no match found, return null
    if (!jsonMatch) {
        return null;
    } else {
        return JSON5.parse(jsonMatch[0]);
    }
}