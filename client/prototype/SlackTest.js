import { useState } from "react";
import { BigTitle, BodyText, OneLineTextInput, Pad, PrimaryButton, ScrollableScreen } from "../component/basics";
import { authorRobEnnals } from "../data/authors";
import { callServerApiAsync } from "../util/servercall";
import { useDatastore } from "../util/datastore";

export const SlackTestPrototype = {
    name: 'SlackTest',
    author: authorRobEnnals,
    date: '2023-08-18',
    key: 'slacktest',
    description: 'Test of Slack integration',
    screen: SlackTestScreen,
    instance: [
        {key: 'test', name: 'Test'}
    ]
}

const channelBottest = 'C05NWQRQ1FB';

function SlackTestScreen() {
    const [text, setText] = useState('');
    const datastore = useDatastore();

    function sendSlackMessage() {
        callServerApiAsync({datastore, component:'slack', funcname: 'message', params: {text, channel: channelBottest}});
    }

    return <ScrollableScreen pad>
        <BigTitle>Slack Test</BigTitle>

        <BodyText>
            Use the controls here to test Slack integration. Outputs will appear in the #bot-testing channel.
        </BodyText>
        <Pad size={16}/>

        <OneLineTextInput label="Message" placeholder="Type a message here" value={text} onChange={setText} />
        <Pad/>
        <PrimaryButton label="Send Message" onPress={sendSlackMessage} />

    </ScrollableScreen>   
}