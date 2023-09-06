const { decodeBytesToFixedPointArray } = require('../botutil/botutil');
const { firebaseReadAsync, fbKeyToString } = require('../botutil/firebaseutil');
const { BOTLAB_SLACK_APP_TOKEN, BOTLAB_DEV_SLACK_APP_TOKEN, SLACK_ENCRYPTION_KEY } = require('../keys');
const { decrypt, decryptBytes } = require('./encryption');

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


async function getSlackAsync({action, data}) {
    console.log('getSlackAsync', {action, data});
    const fetch = await import('node-fetch');

    const isDev = process.env.FUNCTIONS_EMULATOR === 'true';
    const authToken = isDev ? BOTLAB_DEV_SLACK_APP_TOKEN : BOTLAB_SLACK_APP_TOKEN;

    // Convert the data object to a query string
    const queryString = Object.entries(data).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
    
    const url = `https://slack.com/api/${action}?${queryString}`;
    const response = await fetch.default(url, {
        headers: {
            'Authorization': 'Bearer ' + authToken,
            'Content-Type': 'application/json'
        },
        method: 'GET'
    });
    
    return await response.json();
}
exports.getSlackAsync = getSlackAsync;


function decryptMap(map) {
    var decryptedMap = {};
    Object.keys(map).forEach(id => {
        const cipherText = map[id];
        const plainText = decrypt({encryptedText: cipherText, key: SLACK_ENCRYPTION_KEY}).data;
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

function decryptEmbeddingMap(map) {
    var decryptedMap = {};
    Object.keys(map).forEach(id => {
        console.log('mapItem', id, map[id]);
        const buffer = decryptBytes({encryptedData: map[id], key: SLACK_ENCRYPTION_KEY});
        const embedding = decodeBytesToFixedPointArray(buffer);
        decryptedMap[fbKeyToString(id)] = embedding;
    })
    return decryptedMap;
}

async function getEmbeddings({team, path, userEmail}) {
    console.log('userEmail', userEmail, team, path);
    if (!userEmail.endsWith('@newpublic.org')) {
        return {success: false, error: 'Not authorized'};
    }
    const dataPath = 'vault/slack/' + team + '/' + path;
    const encryptedData = await firebaseReadAsync(dataPath);
    const embeddings = decryptEmbeddingMap(encryptedData);
    return {data: embeddings};  
}

exports.apiFunctions = {
    getContent,
    getEmbeddings,
    message: ({text, channel}) => callSlackAsync({action: 'chat.postMessage', data: {text, channel}})
}


