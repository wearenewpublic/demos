import { useState } from "react";
import { useDatastore, useGlobalProperty, usePersonaKey, useSessionData } from "../util/datastore";
import { BigTitle, BodyText, Card, Pad, PadBox, PrimaryButton, ScrollableScreen, SmallTitle } from "../component/basics";
import { gotoLogin, pushSubscreen } from "../util/navigate";
import { authorRobEnnals } from "../data/authors";
import { callServerApiAsync } from "../util/servercall";
import { SlackContext, SlackMessage, getSlackChannels, getSlackMessageEmbeddings, getSlackMessages, getSlackUsers } from "../component/slack";
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
    const [channels, setChannels] = useState();
    const datastore = useDatastore();

    if (!personaKey) {
        if (!personaKey) {
            return <PadBox><PrimaryButton onPress={gotoLogin} label='Log in to Access' /></PadBox>
        }   
    }

    async function onGetChannels() {
        // const pUsers = getSlackUsers({datastore, team});
        const channels = await getSlackChannels({datastore, team});
        // const users = await pUsers;
        console.log('channels', {channels});
        setChannels(channels);
        // setUsers(users);
        // datastore.setSessionData('slackUsers', users);
    }

    return <ScrollableScreen>
        <BigTitle>Slack View</BigTitle>

        <BodyText>Team: {team}</BodyText>

        <Pad size={32} />
        <PrimaryButton label="Get Channels" onPress={() => onGetChannels()} />

        <Pad size={32} />

        {/* <SlackContext.Provider value={{users, messages}}> */}
        {mapKeys(channels, (channelKey, channelInfo) =>
            <SlackChannel key={channelKey} channelKey={channelKey} channelInfo={channelInfo} />
        )}
        {/* </SlackContext.Provider> */}

    </ScrollableScreen>
}

function SlackChannel({channelKey, channelInfo}) {
    return <Card onPress={() => pushSubscreen('channel', {channelKey})}>
        <SmallTitle>#{channelInfo.name}</SmallTitle>
    </Card>
}

function ChannelScreen({channelKey}) {
    // const users = useSessionData('slackUsers');
    const team = useGlobalProperty('team');
    const [users, setUsers] = useState({});
    const [messages, setMessages] = useState();
    const [embeddings, setEmbeddings] = useState();
    const datastore = useDatastore();

    async function onGetContent() {
        const pUsers = getSlackUsers({datastore, team});
        const pMessages = getSlackMessages({datastore, team, channel: channelKey});
        const embeddings = await getSlackMessageEmbeddings({datastore, team, channel: channelKey});
        const messages = await pMessages; 
        const users = await pUsers;
        // const messages = await callServerApiAsync({datastore, component: 'slack', funcname: 'getContent', params: {team, path}});
        console.log('content', {messages});
        console.log('embeddings', {embeddings});
        setMessages(messages);
        setUsers(users);
    }

    async function onGetEmbeddings() {
        console.log('get Embeddings');
        const embeddings = await getSlackMessageEmbeddings({datastore, team, channel: channelKey});
        // const messages = await callServerApiAsync({datastore, component: 'slack', funcname: 'getContent', params: {team, path}});
        console.log('embeddings', {embeddings});
        setEmbeddings(embeddings);
    }


    return <ScrollableScreen pad>
        <BigTitle>Channel View</BigTitle>

        <Pad size={32} />
        <PrimaryButton label="Get Content" onPress={() => onGetContent()} />
        <Pad />
        <PrimaryButton label="Get Embeddings" onPress={() => onGetEmbeddings()} />

        <Pad size={32} />

        <SlackContext.Provider value={{users, messages}}>
            {mapKeys(messages, messageKey =>
                <SlackMessage key={messageKey} messageKey={messageKey} />
            )}
        </SlackContext.Provider>

    </ScrollableScreen>
}

