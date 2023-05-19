const { readFileSync, existsSync } = require('fs');
const keys = require('../keys');
const Mustache = require('mustache');

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

function createGptPrompt({promptKey, params}) {
    console.log('createGptPrompt', {promptKey, params});
    const filename = 'prompts/' + promptKey + '.txt';
    if (!existsSync(filename)) {
        console.log('file does not exist', filename);
        return null;
    }
    const promptTemplate = readFileSync(filename).toString();  
    const prompt = Mustache.render(promptTemplate, params);
    console.log('prompt', prompt);
    return prompt;
}

async function callGptAsync({promptKey, params}) {
    console.log('callGptAsync', {promptKey, params})

    const prompt = createGptPrompt({promptKey, params});
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


exports.apiFunctions = {
    hello: helloAsync,
    chat: callGptAsync,
}


