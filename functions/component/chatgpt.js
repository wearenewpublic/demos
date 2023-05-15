const { robo_mediator_prompt, unproductive_conflict_prompt } = require("../demo/robo-mediator-chat");
const keys = require('../keys');

// Add links to your prompts here so that they can be used with chatGPT
const prompts = {
    robomediator: robo_mediator_prompt,
    unproductive: unproductive_conflict_prompt,
}


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

async function callGptAsync({messagesText, promptKey}) {
    console.log('prompts', prompts);
    console.log('callGptAsync', promptKey, prompts);
    const prompt = prompts[promptKey];
    if (!prompt) {
        return {success: false, error: 'Unknown prompt: ' + promptKey}
    }
    const message = prompt + messagesText;    
    console.log('message', message);
    const result = await callOpenAIAsync({action: 'chat/completions', data: {
        temperature: 0,
        model: 'gpt-3.5-turbo-0301',
        max_tokens: 100,
        messages: [
            {role: 'user', content: message}
        ]
    }});
    console.log('result', result);
    console.log(result.choices?.[0]?.message?.content);
    const responseData = result.choices?.[0]?.message?.content;

    return {data: JSON.parse(responseData)};
}


exports.apiFunctions = {
    hello: helloAsync,
    chat: callGptAsync,
}


