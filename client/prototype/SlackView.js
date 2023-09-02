import { useState } from "react";
import { useDatastore, useGlobalProperty, usePersonaKey } from "../util/datastore";
import { BigTitle, BodyText, Card, Pad, PadBox, PrimaryButton, ScrollableScreen } from "../component/basics";
import { gotoLogin } from "../util/navigate";
import { authorRobEnnals } from "../data/authors";
import { callServerApiAsync } from "../util/servercall";
import { SlackContext, SlackMessage, getSlackMessages, getSlackUsers } from "../component/slack";
import { mapKeys } from "../util/util";

export const SlackViewPrototype = {
    name: 'Slack View',
    author: authorRobEnnals,
    date: '2023-09-01',
    key: 'slackview',
    description: 'Provide a better view of a Slack server',
    screen: SlackViewScreen,
    subscreens: {
        channel: {screen: ChannelScreen, title: 'Channel'},
    },
    newInstanceParams: [
        {key: 'team', name: 'Team Id', type: 'shorttext'},
    ]
}

function SlackViewScreen() {
    const team = useGlobalProperty('team');
    const personaKey = usePersonaKey();
    const [users, setUsers] = useState({});
    const [messages, setMessages] = useState();

    const datastore = useDatastore();

    if (!personaKey) {
        if (!personaKey) {
            return <PadBox><PrimaryButton onPress={gotoLogin} label='Log in to Access' /></PadBox>
        }   
    }

    async function onGetContent() {
        const users = await getSlackUsers({datastore, team});
        const messages = await getSlackMessages({datastore, team, channel: 'C05NWQRQ1FB'});
        // const messages = await callServerApiAsync({datastore, component: 'slack', funcname: 'getContent', params: {team, path}});
        console.log('content', {users, messages});
        setUsers(users);
        setMessages(messages);
    }

    return <ScrollableScreen pad>
        <BigTitle>Slack View</BigTitle>

        <BodyText>Team: {team}</BodyText>

        <Pad size={32} />
        <PrimaryButton label="Get Content" onPress={() => onGetContent()} />

        <Pad size={32} />

        <SlackContext.Provider value={{users, messages}}>
            {mapKeys(messages, messageKey =>
                <SlackMessage key={messageKey} messageKey={messageKey} />
            )}
        </SlackContext.Provider>

    </ScrollableScreen>
}



function ChannelScreen({channelKey}) {
    return <BodyText>Channel: {channelKey}</BodyText>
}