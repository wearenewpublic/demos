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

export async function gptProcessAsync({datastore, promptKey, params, model, funcname='chat'}) {
    console.log('gptProcess', {promptKey, params});
    const rawResponse = await callServerApiAsync({datastore, component:'chatgpt', funcname, params:{promptKey, params, model}});
    console.log('get gpt raw response', rawResponse);
    const parsedResponse = extractAndParseJSON(rawResponse);
    console.log('get gpt response', parsedResponse);
    return parsedResponse;
}

export async function getGptResponse({datastore, promptKey, params}) {
    const rawResponse = await callServerApiAsync({datastore, component: 'chatgpt', funcname: 'chat',
        params: {promptKey, params}
    })
    return rawResponse;
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
        try {
            return JSON5.parse(jsonMatch[0]);
        } catch (e) {
            console.log('failed to parse', jsonMatch[0]);
            const fixedJson = fixUnescapedQuotes(jsonMatch[0]);
            console.log('Trying with fixed JSON', fixedJson);
            return JSON5.parse(fixedJson);
        }
    }
}

function fixUnescapedQuotes(badJson) {
    var goodJson = "";
    var inQuote = false;
    for (var i = 0; i < badJson.length; i++) {
        var char = badJson[i];
        if (char == '"') {
            if (inQuote) {
                const next = nextNonWhitespace(badJson, i+1);
                console.log('next', next);
                if ([':', '}', ']'].includes(next)) {
                    goodJson += '"';
                    inQuote = false;
                } else if (next == ',') {
                    const nextNonComma = nextNonWhitespaceNonComma(badJson, i+1);
                    console.log('noncomma', nextNonComma);
                    if (['"', '}', ']'].includes(nextNonComma)) {
                        goodJson += '"';
                        inQuote = false;
                    } else {
                        goodJson += '\\"';
                    }
                } else {
                    goodJson += '\\"';
                }
            } else {
                goodJson += '"';
                inQuote = true;
            }
        } else {
            goodJson += char;
        }
    }
    return goodJson;
}

function nextNonWhitespace(str, i) {
    while (i < str.length && (str[i] == ' ' || str[i] == '\n')) {
        i++;
    }
    return str[i];
}

function nextNonWhitespaceNonComma(str, i) {
    while (i < str.length && (str[i] == ' ' || str[i] == '\n' || str[i] == ',')) {
        i++;
    }
    return str[i];
}
