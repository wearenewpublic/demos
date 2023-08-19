const { App } = require('@slack/bolt');
const { BOTLAB_SLACK_APP_TOKEN, BOTLAB_SLACK_SECRET, BOTLAB_VERIFICATION_TOKEN } = require('../keys');
const { callSlackAsync } = require('../component/slack');
const cors = require('cors')({origin: true})

// const fetch = await import('node-fetch');

console.log('BOTLAB_SLACK_APP_TOKEN', BOTLAB_SLACK_APP_TOKEN);
console.log('BOTLAB_SLACK_SECRET', BOTLAB_SLACK_SECRET);

const botlabApp = new App({
    token: BOTLAB_SLACK_APP_TOKEN,
    signingSecret: BOTLAB_SLACK_SECRET
});


async function botlabHandlerAsync(req, res) {
    console.log('botlabHandlerAsync', req.body);

    const { challenge, event, token } = req.body;
    if (challenge) {
        res.send(challenge);
        return;
    } 

    if (token != BOTLAB_VERIFICATION_TOKEN) {
        console.log('Invalid token', token);
        res.status(401).send({error: 'Invalid token'});
        return;
    }
    
    switch (event?.type) {
        case 'app_mention':
            const { text, channel } = event;
            callSlackAsync({action: 'chat.postMessage', data: {text: 'You said: ' + text, channel}});
            break;
        default:
            console.log('Unhandled event', event?.type);
    }
    cors(req, res, () => {
        res.send();
    });
}


exports.botlabHandlerAsync = botlabHandlerAsync;
