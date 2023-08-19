const { BOTLAB_SLACK_APP_TOKEN } = require('../keys');

async function callSlackAsync({action, data}) {
    console.log('callSlackAsync', {action, data});
    const fetch = await import('node-fetch');

    const url = 'https://slack.com/api/' + action;
    const response = await fetch.default(url, {
        headers: {
            'Authorization': 'Bearer ' + BOTLAB_SLACK_APP_TOKEN,
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    })        
    return await response.json();
}

exports.callSlackAsync = callSlackAsync

exports.apiFunctions = {
    message: ({text, channel}) => callSlackAsync({action: 'chat.postMessage', data: {text, channel}})
}


