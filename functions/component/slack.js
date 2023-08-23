const { BOTLAB_SLACK_APP_TOKEN, BOTLAB_DEV_SLACK_APP_TOKEN } = require('../keys');

async function sendSlackCommandResponseAsync({response_url, response}) {
    const fetch = await import('node-fetch');

    if (typeof response === 'string') {
        jsonText = JSON.stringify({text: response, replace_original: true, response_type: 'ephemeral'});
    } else {
        jsonText = JSON.stringify({blocks: response, replace_original: true, response_type: 'ephemeral'});
    }

    const response_result = await fetch.default(response_url, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: jsonText
    })
}
exports.sendSlackCommandResponseAsync = sendSlackCommandResponseAsync;

async function callSlackAsync({action, data}) {
    console.log('callSlackAsync', {action, data});
    const fetch = await import('node-fetch');

    const isDev = process.env.FUNCTIONS_EMULATOR === 'true';
    const authToken = isDev ? BOTLAB_DEV_SLACK_APP_TOKEN : BOTLAB_SLACK_APP_TOKEN;

    const url = 'https://slack.com/api/' + action;
    const response = await fetch.default(url, {
        headers: {
            'Authorization': 'Bearer ' + authToken,
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

