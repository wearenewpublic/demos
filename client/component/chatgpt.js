import { getGlobalProperty, getObject } from "../util/localdata";
import { callServerApiAsync } from "../util/servercall";
const JSON5 = require('json5');


export async function askGptToRespondToConversationAsync({promptKey, messages, newMessageText}) {
    const messagesText = messagesToGptString({messages, newMessageText});
    const response = await gptProcessAsync({promptKey, params: {messagesText}});
    return response?.messageText || null;

    // console.log('askGptToRespondToConversation', {promptKey, messagesText});
    // const rawResponse = await callServerApiAsync('chatgpt', 'chat', {promptKey, params: {messagesText}});
    // console.log('got GPT response', {rawResponse});
    // const parsedResponse = extractAndParseJSON(rawResponse);
    // return parsedResponse?.messageText || null;
}

export async function askGptToEvaluateMessageTextAsync({promptKey, text}) {
    const response = await gptProcessAsync({promptKey, params: {text}});
    return response?.judgement || false;

    // console.log('askGptToEvaluateMessageText', {promptKey, text});
    // const rawResponse = await callServerApiAsync('chatgpt', 'chat', {promptKey, params: {text}});
    // console.log('ot GPT response', {rawResponse});
    // const parsedResponse = extractAndParseJSON(rawResponse);
    // return parsedResponse?.judgement || false;
}

export async function gptProcessAsync({promptKey, params}) {
    console.log('gptProcess', {promptKey, params});
    const rawResponse = await callServerApiAsync('chatgpt', 'chat', {promptKey, params});
    const parsedResponse = extractAndParseJSON(rawResponse);
    console.log('get gpt response', parsedResponse);
    return parsedResponse;
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