const { readFileSync, existsSync } = require('fs');
const keys = require('../keys');
const Mustache = require('mustache');
const { encodeFixedPointArrayToBytes, decodeBytesToFixedPointArray } = require('../botutil/botutil');
const { decryptBytes, encryptBytes } = require('./encryption');

async function callOpenAIAsync({action, data}) {
    const fetch = await import('node-fetch');

    const url = 'https://api.openai.com/v1/' + action;
    const response = await fetch.default(url, {
        headers: {
            'Authorization': 'Bearer ' + keys.OPENAI_KEY,
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    })        
    return await response.json();
}


async function helloAsync({name}) {
    return {data: "Hello " + name};
}

function createGptPrompt({promptKey, params, language='English'}) {
    console.log('createGptPrompt', {promptKey, params, language});
    const filename = 'prompts/' + promptKey + '.txt';
    if (!existsSync(filename)) {
        console.log('file does not exist', filename);
        return null;
    }
    const promptTemplate = readFileSync(filename).toString();  
    const prompt = Mustache.render(promptTemplate, {...params, language});
    return prompt;
}

async function callGptAsync({promptKey, params, language}) {
    console.log('callGptAsync', {promptKey, params, language})

    const prompt = createGptPrompt({promptKey, params, language});
    if (!prompt) {
        return {success: false, error: 'Unknown prompt: ' + promptKey}
    }

    console.log('prompt', prompt);
    const result = await callOpenAIAsync({action: 'chat/completions', data: {
        temperature: 0,
        model: 'gpt-3.5-turbo',
        max_tokens: 1000,
        messages: [
            {role: 'user', content: prompt}
        ]
    }});
    console.log('result', result);
    console.log(result.choices?.[0]?.message?.content);
    const data = result.choices?.[0]?.message?.content;

    return {data};
}

exports.callGptAsync = callGptAsync;

async function getEmbeddingsAsync({text}) {
    const result = await callOpenAIAsync({action: 'embeddings', data: {
        input: text,
        'model': 'text-embedding-ada-002'
    }});
    // console.log('result', result);
    if (result.data?.[0].embedding) {
        return {data: result.data?.[0].embedding};
    } else {
        return {success: false, error: result.error}
    }
}
exports.getEmbeddingsAsync = getEmbeddingsAsync;

async function getEmbeddingsArrayAsync({textArray}) {
    console.log('textArray', textArray);
    const result = await callOpenAIAsync({action: 'embeddings', data: {
        input: textArray,
        'model': 'text-embedding-ada-002'
    }});
    // console.log('result', result);
    console.log('result', result);
    const embeddings = result.data.map(d => d.embedding)
    return embeddings;
}
exports.getEmbeddingsArrayAsync = getEmbeddingsArrayAsync;




exports.apiFunctions = {
    hello: helloAsync,
    chat: callGptAsync,
    embedding: getEmbeddingsAsync
}


