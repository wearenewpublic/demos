const { App } = require('@slack/bolt');
const { BOTLAB_SLACK_APP_TOKEN, BOTLAB_SLACK_SECRET, BOTLAB_VERIFICATION_TOKEN, BOTLAB_DEV_VERIFICATION_TOKEN } = require('../keys');
const { callSlackAsync } = require('../component/slack');
const { commands } = require('../bot');
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
            handleMentionAsync({text, channel});
            break;
        default:
            console.log('Unhandled event', type);
    }
}

async function handleMentionAsync({text, channel}) {
    console.log('handleMentionAsync', text, channel);
    const [mention, commandKey, ...args] = text.split(' ');
    if (!mention.startsWith('<@U')) {
        console.log('Not a command mention. Ignore it', text);
        return;
    }
    const command = commands[commandKey];
    if (command) {
        const response = await command.action({args, channel});
        if (typeof response === 'string') {
            callSlackAsync({action: 'chat.postMessage', data: {text: response, channel}});
        } else {
            callSlackAsync({action: 'chat.postMessage', data: {blocks: response, channel}});
        }

    }
}

async function handleCommandAsync(text, response_url) {
    console.log('handleCommand', text);
    const [commandKey, ...args] = text.split(' ');
    const command = commands[commandKey];
    if (command) {
        const response = await command.action({args, response_url});
        return {response, isPublic: false};
    } else {
        return {response: 'Unknown command: ' + commandKey, isPublic: false};
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
        var jsonText;
        if (typeof response === 'string') {
            jsonText = JSON.stringify({text: response, response_type: isPublic ? 'in_channel' : 'ephemeral'});
        } else {
            jsonText = JSON.stringify({blocks: response, response_type: isPublic ? 'in_channel' : 'ephemeral'});
        }
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
