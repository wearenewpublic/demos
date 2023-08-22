const { App } = require('@slack/bolt');
const { BOTLAB_SLACK_APP_TOKEN, BOTLAB_SLACK_SECRET, BOTLAB_VERIFICATION_TOKEN, BOTLAB_DEV_VERIFICATION_TOKEN } = require('../keys');
const { callSlackAsync } = require('../component/slack');
const cors = require('cors')({origin: true})

// const fetch = await import('node-fetch');

console.log('BOTLAB_SLACK_APP_TOKEN', BOTLAB_SLACK_APP_TOKEN);
console.log('BOTLAB_SLACK_SECRET', BOTLAB_SLACK_SECRET);

const botlabApp = new App({
    token: BOTLAB_SLACK_APP_TOKEN,
    signingSecret: BOTLAB_SLACK_SECRET
});



async function handleEvent(event) {
    console.log('handleEvent', event);
    const { type, text, channel } = event;
    switch (type) {
        case 'app_mention':
            callSlackAsync({action: 'chat.postMessage', data: {text: 'You mentioned my name', channel}});
            break;
        default:
            console.log('Unhandled event', type);
    }
}

async function handleCommandAsync(text, response_url) {
    console.log('handleCommand', text);
    const [command, ...args] = text.split(' ');
    switch (command) {
        case 'ping':
            return {response: 'pong', isPublic: true};
        case 'private':
            return {response: 'private pong', isPublic: false};
        default:
            return {response: 'Unknown command', isPublic: false};
    }
}

async function botlabHandlerAsync(req, res) {
    console.log('botlabHandlerAsync', req.body);

    const { challenge, command, text, response_url, event, token } = req.body;
    if (challenge) {
        res.send(challenge);
        return;
    } 

    if (token != BOTLAB_VERIFICATION_TOKEN && token != BOTLAB_DEV_VERIFICATION_TOKEN) {
        console.log('Invalid token', token);
        res.status(401).send({error: 'Invalid token'});
        return;
    }

    if (event) {
        await handleEvent(event);
    } else if (command) {
        const {response, isPublic} = await handleCommandAsync(text, response_url);
        console.log('response', response, isPublic);
        const jsonText = JSON.stringify({text: response, response_type: isPublic ? 'in_channel' : 'ephemeral'});
        console.log('jsonText', jsonText);
        cors(req, res, () => {
            res.set('Content-Type', 'application/json');
            res.send(jsonText);
        });
        return;
    }

    cors(req, res, () => {
        res.send();
    });
}


exports.botlabHandlerAsync = botlabHandlerAsync;
