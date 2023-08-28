const { BOTLAB_SLACK_APP_TOKEN, BOTLAB_SLACK_SECRET, BOTLAB_VERIFICATION_TOKEN, BOTLAB_DEV_VERIFICATION_TOKEN } = require('../keys');
const { callSlackAsync, sendSlackCommandResponseAsync } = require('../component/slack');
const { commands } = require('../bot');
const cors = require('cors')({origin: true})


async function handleEvent(event) {
    console.log('handleEvent', event);
    const { type, text, channel, thread_ts } = event;
    switch (type) {
        case 'app_mention':
            handleMentionAsync({text, channel, thread_ts});
            break;
        default:
            console.log('Unhandled event', type);
    }
}

async function handleMentionAsync({text, channel, thread_ts}) {
    console.log('handleMentionAsync', text, channel);
    const [mention, commandKey, ...args] = text.split(' ');
    if (!mention.startsWith('<@U')) {
        console.log('Not a command mention. Ignore it', text);
        return;
    }
    const command = commands[commandKey];
    if (command) {
        if (command.slow) {
            callSlackAsync({action: 'chat.postMessage', data: {text: 'Working on it...', thread_ts, channel}});
        }
        const response = await command.action({args, channel});
        if (typeof response === 'string') {
            callSlackAsync({action: 'chat.postMessage', data: {text: response, thread_ts, channel}});
        } else {
            callSlackAsync({action: 'chat.postMessage', data: {blocks: response, thread_ts, channel}});
        }
    } else {
        callSlackAsync({action: 'chat.postMessage', data: {text: 'Unknown command: ' + commandKey + '\n\nUse the "help" command to get help, or the "list" command to list available commands.', thread_ts, channel}});
    }
}

async function handleCommandAsync({req, res, text, channel, response_url}) {
    console.log('handleCommand', text);

    const [commandKey, ...args] = text.split(' ');
    const command = commands[commandKey];
    var response;
    if (command) {
        cors(req, res, () => {
            if (command.slow) {
                res.send('Working on it...');
            } else {
                res.send();
            }
        });
        response = await command.action({args, channel, response_url});
    } else {
        cors(req, res, () => {
            res.send();
        });
        response = 'Unknown command: ' + commandKey + '\n\nUse the "help" command to get help, or the "list" command to list available commands.';
    }
    sendSlackCommandResponseAsync({response_url, response});
}

async function botlabHandlerAsync(req, res) {
    console.log('botlabHandlerAsync', req.body);

    const { challenge, command, text, response_url, channel_id, event, token } = req.body;
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
        cors(req, res, () => {
            res.send();
        });
        await handleEvent(event);
    } else if (command) {
        await handleCommandAsync({req, res, text, channel: channel_id, response_url});
    }
}


exports.botlabHandlerAsync = botlabHandlerAsync;
