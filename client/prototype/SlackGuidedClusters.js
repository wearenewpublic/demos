import { useContext, useEffect, useState } from "react";
import { useDatastore, useGlobalProperty, usePersonaKey, useSessionData } from "../util/datastore";
import { BigTitle, BodyText, Card, Center, HorizBox, Narrow, OneLineTextInput, Pad, PadBox, Pill, PrimaryButton, ScrollableScreen, Separator, SmallTitle, WideScreen } from "../component/basics";
import { gotoLogin, pushSubscreen } from "../util/navigate";
import { authorRobEnnals } from "../data/authors";
import { callServerApiAsync } from "../util/servercall";
import { SlackChannelList, SlackContext, SlackMessage, SlackMessageList, SlackMessagesWithInfoPanel, getSlackChannels, getSlackMessageEmbeddings, getSlackMessages, getSlackUsers, replaceLinks, replaceUserMentions, useSlackChannels, useSlackEmbeddings, useSlackMessageEmbeddings, useSlackMessages, useSlackUsers } from "../component/slack";
import { mapKeys } from "../util/util";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { ScrollView, View } from "react-native";
import { addContextToShortMessageEmbeddings, clusterWithKMeans, getRandomClusterIndices, invertClusterMap, kMeans, sortEmbeddingsByDistance } from "../util/cluster";
import { gptProcessAsync } from "../component/chatgpt";
import { QuietSystemMessage } from "../component/message";
import { ExpandSection } from "../component/expand-section";

export const SlackGuidedClustersPrototype = {
    name: 'Slack Guided Clusters',
    author: authorRobEnnals,
    date: '2023-09-12',
    key: 'slackguided',
    description: 'Organize Slack Messages into clusters based on descriptions you specify',
    screen: SlackGuidedClustersScreen,
    subscreens: {
        channel: {screen: ChannelScreen, title: 'Channel'},
    },
    newInstanceParams: [
        {key: 'team', name: 'Team Id', type: 'shorttext'},
    ]
}

function SlackGuidedClustersScreen() {
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

    function onNewClusters({clusterMap, clusterNames}) {
        setClusterMap(clusterMap);
        setClusterNames(clusterNames);
    }

    return <SlackContext.Provider value={{users, messages, embeddings, clusterMap, clusterNames}}>
        <ClusterEditor messages={messages} onNewClusters={onNewClusters} />
        <Separator pad={0} />
        <SlackMessageList messages={messages} authorLineWidget={ClusterWidget}/>
    </SlackContext.Provider>
}

function ClusterWidget({messageKey}) {
    const {clusterMap, clusterNames} = useContext(SlackContext);
    const cluster = clusterMap?.[messageKey];
    if (!cluster || !clusterNames?.[cluster]) return null;
    return <PadBox vert={0}><Pill text={clusterNames[cluster]} /></PadBox>
}

function ClusterEditor({messages, onNewClusters}) {
    const [clusterDescriptions, setClusterDescriptions] = useState([{},{},{},{}]);
    const [inProgress, setInProgress] = useState(false);

    async function onComputeClusters() {
        const clusterTexts = clusterDescriptions.map(description => description.name);
        // const clusterEmbeddings = 
    }

    return <Center>
        <ExpandSection title='Cluster Descriptions'>
            {clusterDescriptions.map((description, index) =>   
                <PadBox>
                    <HorizBox>
                        <OneLineTextInput value={description.name || ''} 
                            placeholder={'Cluster ' + (index+1) + ' name'}
                            onChange={text => setClusterDescriptions(clusterDescriptions.map((d, i) => i === index ? {...d, name: text} : d))}
                        />
                    </HorizBox>
                </PadBox>
            )}
            <Pad/>
            <HorizBox>
                <PrimaryButton label="New Cluster" onPress={() => setClusterDescriptions([...clusterDescriptions, {}])} />
            </HorizBox>
        </ExpandSection>
        <Pad/>
            {inProgress && <QuietSystemMessage label='Computing clusters...' />}
            {!inProgress && <PrimaryButton label="Compute Clusters" onPress={() => onComputeClusters()} />}
        <Pad/>

    </Center>
}
