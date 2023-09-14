import { useContext, useEffect, useState } from "react";
import { useDatastore, useGlobalProperty, usePersonaKey, useSessionData } from "../util/datastore";
import { BigTitle, BodyText, Card, Center, HorizBox, Narrow, OneLineTextInput, Pad, PadBox, Pill, PrimaryButton, ScrollableScreen, SectionTitleLabel, Separator, SmallTitle, WideScreen } from "../component/basics";
import { gotoLogin, pushSubscreen } from "../util/navigate";
import { authorRobEnnals } from "../data/authors";
import { callServerApiAsync } from "../util/servercall";
import { SlackChannelList, SlackContext, SlackMessage, SlackMessagesWithInfoPanel, getSlackChannels, getSlackMessageEmbeddings, getSlackMessages, getSlackUsers, replaceLinks, replaceUserMentions, useSlackChannels, useSlackEmbeddings, useSlackMessageEmbeddings, useSlackMessages, useSlackUsers } from "../component/slack";
import { mapKeys } from "../util/util";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { ScrollView, View } from "react-native";
import { addContextToShortMessageEmbeddings, clusterWithKMeans, getRandomClusterIndices, invertClusterMap, kMeans, sortEmbeddingsByDistance } from "../util/cluster";
import { gptProcessAsync } from "../component/chatgpt";
import { QuietSystemMessage } from "../component/message";

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

    return <ScrollableScreen>
        <Center><BodyText>Team: {team}</BodyText></Center>

        <SlackChannelList onPressChannel={({channelKey}) => pushSubscreen('channel', {channelKey})} />
    </ScrollableScreen>
}

function ChannelScreen({channelKey}) {
    const messages = useSlackMessages({channelKey});
    const users = useSlackUsers();
    const embeddings = useSlackMessageEmbeddings({channelKey});
    const [clusterMap, setClusterMap] = useState({});
    const [clusterNames, setClusterNames] = useState({});
    const datastore = useDatastore();
    const [inProgress, setInProgress] = useState(false);

    async function onGetClusters() {
        setInProgress(true);
        setClusterNames({});
        // const mergedEmbeddings = addContextToShortMessageEmbeddings({embeddings, messages});
        // const {clusterToMessages, messageToCluster} = clusterWithKMeans(mergedEmbeddings, 10);
        const {clusterToMessages, messageToCluster} = clusterWithKMeans(embeddings, 10);
        setClusterMap(messageToCluster);
        const randomClusterMembers = getRandomClusterIndices(clusterToMessages, 5);
        const randomClusterTexts = randomClusterMembers.map((keys, index) => ({  
            messages: keys.map(key => 
                replaceLinks({text: replaceUserMentions({text:messages[key]?.text, users})}).slice(0,100)),
            clusterName: 'Cluster ' + index      
        }))
        console.log('randomClusterTexts', randomClusterTexts);
        const clusterNames = await gptProcessAsync({datastore, promptKey: 'cluster_label', params: {clusters: JSON.stringify(randomClusterTexts, null, 2)}});
        console.log('clusterNames', clusterNames);
        setClusterNames(clusterNames);
        setInProgress(false);
    }


    return <SlackContext.Provider value={{users, messages, embeddings, clusterMap, clusterNames}}>
        <Center>
            <Pad/>
            {inProgress && <QuietSystemMessage label='Computing clusters...' />}
            {!inProgress && <PrimaryButton label="Compute Clusters" onPress={() => onGetClusters()} />}
            <Pad/>
        </Center>
        <Separator pad={0} />
        <SlackMessagesWithInfoPanel messages={messages} infoPanel={MessageInfoPanel} authorLineWidget={ClusterWidget}/>
    </SlackContext.Provider>
}

function ClusterWidget({messageKey}) {
    const {clusterMap, clusterNames} = useContext(SlackContext);
    const cluster = clusterMap?.[messageKey];
    if (!cluster) return null;
    if (clusterNames?.[cluster]) {
        return <PadBox vert={0}><Pill text={clusterNames[cluster]} /></PadBox>
    } else {
        return <PadBox vert={0}><Pill text={cluster} /></PadBox>
    }
}

function MessageInfoPanel({messageKey}) {
    const {embeddings, messages} = useContext(SlackContext);
    // const [closest, setClosest] = useState([]);

    // useEffect(() => {
    //     setClosest([])
    // }, [messageKey]);

    if (!messageKey || !embeddings) return null;
    const embedding = embeddings[messageKey];

    const closest = sortEmbeddingsByDistance(messageKey, embedding, embeddings);



    // function onGetClosestMessages() {
    //     const closest = sortEmbeddingsByDistance(messageKey, embedding, embeddings);
    //     setClosest(closest);
    // }


    return <View style={{flex: 1, borderLeftColor: '#ddd', borderLeftWidth: 1, marginLeft: 8, paddingLeft: 16, paddingRight: 16}}>
        <ScrollView>
            <Narrow>
                <SlackMessage messageKey={messageKey} />
                <OneLineTextInput value={embedding ? embedding.join(', ') : ''} />
                <Pad size={32} />
                {/* <Separator /> */}
                <Center><SectionTitleLabel label='Related Messages' /></Center>
                {/* <PrimaryButton label="Get Closest" onPress={() => onGetClosestMessages()} /> */}
                {
                    closest.map(({key}) =>
                        <SlackMessage key={key} messageKey={key} />
                    )
                }
            </Narrow>
        </ScrollView>
    </View>
}

