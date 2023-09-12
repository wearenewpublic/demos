import { useContext, useEffect, useState } from "react";
import { useDatastore, useGlobalProperty, usePersonaKey, useSessionData } from "../util/datastore";
import { BigTitle, BodyText, Card, Center, HorizBox, Narrow, OneLineTextInput, Pad, PadBox, Pill, PrimaryButton, ScrollableScreen, Separator, SmallTitle, WideScreen } from "../component/basics";
import { gotoLogin, pushSubscreen } from "../util/navigate";
import { authorRobEnnals } from "../data/authors";
import { callServerApiAsync } from "../util/servercall";
import { SlackContext, SlackMessage, getSlackChannels, getSlackMessageEmbeddings, getSlackMessages, getSlackUsers, replaceLinks, replaceUserMentions } from "../component/slack";
import { mapKeys } from "../util/util";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { ScrollView, View } from "react-native";
import { clusterWithKMeans, getRandomClusterIndices, invertClusterMap, kMeans, sortEmbeddingsByDistance } from "../util/cluster";

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
    const [selectedMessage, setSelectedMessage] = useState();
    const [clusterMap, setClusterMap] = useState({});
    const [clusters, setClusters] = useState();
    const datastore = useDatastore();

    const sortedMessageKeys = Object.keys(messages || {}).sort((a, b) => messages[a].ts - messages[b].ts);

    console.log('clusterMap', clusterMap);

    console.log('messages', messages);

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
        setEmbeddings(embeddings);
    }

    async function onGetClusters() {
        const {centroids, clusters, clusterToMessages, messageToCluster} = clusterWithKMeans(embeddings, 8);

        console.log('clusters', {centroids, clusters, messageToCluster, clusterToMessages});
        setClusterMap(messageToCluster);
        setClusters(clusters);
        console.log('getRandom');
        const randomClusterMembers = getRandomClusterIndices(clusterToMessages, 6);
        console.log('randomMembers', randomClusterMembers);
        const randomClusterTexts = randomClusterMembers.map(keys => keys.map(key => 
            replaceLinks({text: replaceUserMentions({text:messages[key]?.text, users})})
        ))
        console.log('randomClusterTexts', randomClusterTexts);
    }

    return <WideScreen>
        <Center>
            <Pad />
            <HorizBox center>
                <PrimaryButton label="Get Content" onPress={() => onGetContent()} />
                <Pad />
                {
                    embeddings && <PrimaryButton label="Get Clusters" onPress={() => onGetClusters()} />
                }
            </HorizBox>
            <Pad />
        </Center>
        <Separator pad={0} />

        <SlackContext.Provider value={{users, messages, clusterMap}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{flex: 1}}>
                    <BottomScroller>
                        <Narrow>
                            <SlackContext.Provider value={{users, messages, clusterMap}}>
                                {sortedMessageKeys.map((messageKey, idx) =>
                                    <SlackMessage key={messageKey}
                                        authorLineWidget={ClusterWidget}
                                        messageKey={messageKey}
                                        prevMessageKey={sortedMessageKeys[idx - 1]} 
                                        onPress={() => setSelectedMessage(messageKey)} />
                                )}
                            </SlackContext.Provider>
                        </Narrow>
                        {/* </Narrow> */}
                    </BottomScroller>
                </View>
                <MessageInfoPanel embeddings={embeddings} messages={messages} messageKey={selectedMessage} />
            </View>
        </SlackContext.Provider>

    </WideScreen>
}

function ClusterWidget({message, messageKey}) {
    const {clusterMap} = useContext(SlackContext);
    const cluster = clusterMap?.[messageKey];
    if (!cluster) return null;
    return <PadBox vert={0}><Pill text={cluster} /></PadBox>
}

function MessageInfoPanel({embeddings, messages, messageKey}) {
    if (!messageKey || !embeddings) return null;
    const embedding = embeddings[messageKey];
    console.log('this embedding', {embeddings, messageKey, embedding});
    const [closest, setClosest] = useState([]);

    function onGetClosestMessages() {
        const closest = sortEmbeddingsByDistance(messageKey, embedding, embeddings);
        setClosest(closest);
    }

    useEffect(() => {
        setClosest([])
    }, [messageKey]);

    return <View style={{flex: 1, borderLeftColor: '#ddd', borderLeftWidth: 1, marginLeft: 8, paddingLeft: 16, paddingRight: 16}}>
        <ScrollView>
            <Narrow>
                <SlackMessage messageKey={messageKey} />
                <OneLineTextInput value={embedding ? embedding.join(', ') : ''} />
                <Pad />
                <PrimaryButton label="Get Closest" onPress={() => onGetClosestMessages()} />
                {
                    closest.map(({key}) =>
                        <SlackMessage key={key} messageKey={key} />
                    )
                }
            </Narrow>
        </ScrollView>
    </View>
}

