import { getGlobalProperty, getObject } from "../util/localdata";
import { callServerApiAsync } from "../util/servercall";
const JSON5 = require('json5');


export async function askGptToRespondToConversationAsync({promptKey, messages, newMessageText}) {
    const messagesText = messagesToGptString({messages, newMessageText});
    console.log('askGptToRespondToConversation', {promptKey, messagesText});
    const rawResponse = await callServerApiAsync('chatgpt', 'chat', {promptKey, params: {messagesText}});
    console.log('got GPT response', {rawResponse});
    const parsedResponse = extractAndParseJSON(rawResponse);
    return parsedResponse?.messageText || null;
}

export async function askGptToEvaluateMessageTextAsync({promptKey, text}) {
    console.log('askGptToEvaluateMessageText', {promptKey, text});
    const rawResponse = await callServerApiAsync('chatgpt', 'chat', {promptKey, params: {text}});
    console.log('ot GPT response', {rawResponse});
    const parsedResponse = extractAndParseJSON(rawResponse);
    return parsedResponse?.judgement || false;

}

export function messagesToGptString({messages, newMessageText}) {
    const personaKey = getGlobalProperty('$personaKey');
    const allMessages = [...messages, {text: newMessageText, from: personaKey}];
    return allMessages.map(message => getObject('persona', message.from)?.name + ': ' + JSON.stringify(message.text)).join('\n\n');
}


function extractAndParseJSON(text) {
    // Find JSON pattern using regular expression
    const jsonPattern = /{(?:[^{}]|{[^{}]*})*}/;
  
    // Extract JSON from the text
    const jsonMatch = text.match(jsonPattern);
    
    // If no match found, return null
    if (!jsonMatch) {
        return null;
    } else {
        return JSON5.parse(jsonMatch[0]);
    }
}