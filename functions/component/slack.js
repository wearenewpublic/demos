const { firebaseReadAsync, fbKeyToString } = require('../botutil/firebaseutil');
const { BOTLAB_SLACK_APP_TOKEN, BOTLAB_DEV_SLACK_APP_TOKEN, SLACK_ENCRYPION_KEY } = require('../keys');
const { decrypt } = require('./encryption');

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


function decryptMap(map) {
    var decryptedMap = {};
    Object.keys(map).forEach(id => {
        const cipherText = map[id];
        const plainText = decrypt({encryptedText: cipherText, key: SLACK_ENCRYPION_KEY}).data;
        decryptedMap[fbKeyToString(id)] = JSON.parse(plainText);
    })
    return decryptedMap;
}

async function getContent({team, path, userEmail}) {
    console.log('userEmail', userEmail);
    if (userEmail.endsWith('@newpublic.org')) {
        const dataPath = 'vault/slack/' + team + '/' + path;
        const encryptedData = await firebaseReadAsync(dataPath);
        const data = decryptMap(encryptedData);
        return {data};
    } else {
        return {success: false, error: 'Not authorized'};
    }
}


exports.apiFunctions = {
    getContent,
    message: ({text, channel}) => callSlackAsync({action: 'chat.postMessage', data: {text, channel}})
}


