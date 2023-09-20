import { useContext, useEffect, useState } from "react";
import { useCollection, useDatastore, useGlobalProperty, usePersonaKey, useSessionData } from "../util/datastore";
import { BigTitle, BodyText, Card, Center, HorizBox, ListItem, LoadingScreen, Narrow, OneLineTextInput, Pad, PadBox, Pill, PrimaryButton, ScrollableScreen, Separator, SmallTitle, WideScreen } from "../component/basics";
import { gotoLogin, pushSubscreen } from "../util/navigate";
import { authorRobEnnals } from "../data/authors";
import { callServerApiAsync } from "../util/servercall";
import { SlackChannelList, SlackContext, SlackMessage, SlackMessageList, SlackMessagesWithInfoPanel, getSlackChannels, getSlackMessageEmbeddings, getSlackMessages, getSlackUsers, replaceLinks, replaceUserMentions, useSlackChannels, useSlackEmbeddings, useSlackMessageEmbeddings, useSlackMessages, useSlackUsers } from "../component/slack";
import { mapKeys } from "../util/util";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { ScrollView, View } from "react-native";
import { addContextToShortMessageEmbeddings, clusterWithKMeans, getRandomClusterIndices, invertClusterMap, kMeans, sortEmbeddingsByDistance } from "../util/cluster";
import { gptProcessAsync, messagesToGptString } from "../component/chatgpt";
import { QuietSystemMessage } from "../component/message";
import { ExpandSection } from "../component/expand-section";
import { PopupSelector } from "../platform-specific/popup.web";

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
    const messageEmbeddings = useSlackMessageEmbeddings({channelKey});
    // const [clusterMap, setClusterMap] = useState({});
    const [clusterNames, setClusterNames] = useState({});
    const [clusterEmbeddings, setClusterEmbeddings] = useState(null);
    const datastore = useDatastore();

    if (!users || !messages || !messageEmbeddings) return <LoadingScreen />;

    const sortedMessageKeys = Object.keys(messages || {}).sort((a, b) => messages[a].ts - messages[b].ts);

    async function onComputeClusters({clusterDescriptions}) {
        console.log('compute', clusterDescriptions);
        const names = clusterDescriptions.map(d => d.name).filter(x => x);
        const clusterEmbeddings = await callServerApiAsync({datastore, component: 'chatgpt', funcname: 'embeddingArray', 
            params: {textArray: names}});
        setClusterNames(names);
        setClusterEmbeddings(clusterEmbeddings);

        // var clusterMap = {};
        // sortedMessageKeys.forEach(messageKey => {
        //     const messageEmbedding = embeddings[messageKey];
        //     const clusterIndex = sortEmbeddingsByDistance(null, messageEmbedding, clusterEmbeddings)[0].key;
        //     clusterMap[messageKey] = clusterIndex;
        // })

        console.log('embeddings', clusterEmbeddings);     
    }

    return <SlackContext.Provider value={{users, messages, messageEmbeddings, clusterEmbeddings, clusterNames}}>
        <Narrow>
            {/* <ClusterSetSelector selected={clusterSetKey} onSelect={onSelectClusterSet} /> */}
            <ClusterEditor onComputeClusters={onComputeClusters} />
            <Pad/>

        </Narrow>
        <Separator pad={0} />
        <SlackMessageList sortedMessageKeys={sortedMessageKeys} authorLineWidget={ClusterWidget}/>
    </SlackContext.Provider>
}


function ClusterSetSelector({selected, onSelect, onNew}) {
    const clusters = useCollection('clusterSet');
    const items = clusters.map(cluster => ({key: cluster.key, label: cluster.name}));

    return <PopupSelector value={selected ?? 'select'} items={[{key: 'select', label: 'Select a Cluster Set'}, ...items]} onSelect={onSelect} style={{flex: 1}} />
}



function ClusterWidget({messageKey}) {
    const {clusterEmbeddings, clusterNames, messageEmbeddings} = useContext(SlackContext);
    const messageEmbedding = messageEmbeddings?.[messageKey];

    if (!clusterEmbeddings || !clusterNames || !messageEmbedding) return null;

    const rankedClusters = sortEmbeddingsByDistance(null, messageEmbedding, clusterEmbeddings);
    const clusterIndex = rankedClusters?.[0]?.key;
    const clusterDistance = rankedClusters?.[0]?.distance.toFixed(2);

    const clusterName = clusterNames?.[clusterIndex];
    return <PadBox vert={0}><Pill text={clusterName + ' ' + clusterDistance} /></PadBox>
}

function ClusterEditor({onComputeClusters}) {
    const [clusterSetName, setClusterSetName] = useState('');
    const [clusterDescriptions, setClusterDescriptions] = useState([{},{},{},{}]);
    const [clusterSetKey, setClusterSetKey] = useState(null);
    const datastore = useDatastore();
    const [inProgress, setInProgress] = useState(false);


    async function onSave() {
        const clusterSetKey = await datastore.addObject('clusterSet', {name: clusterSetName, description: JSON.stringify(clusterDescriptions)});
        setClusterSetKey(clusterSetKey);
    }

    function onSelectClusterSet(clusterSetKey) {
        if (clusterSetKey === 'select') return;
        setClusterSetKey(clusterSetKey);
        const clusterSet = datastore.getObject('clusterSet', clusterSetKey);
        const descriptions = JSON.parse(clusterSet.description);
        setClusterDescriptions(descriptions);
    }

    async function onCompute() {
        setInProgress(true);
        await onComputeClusters({clusterDescriptions});
        setInProgress(false);
    }

    return <View>
        <ClusterSetSelector selected={clusterSetKey} onSelect={onSelectClusterSet} />
        <ExpandSection title='Edit Cluster Set'>
            {clusterDescriptions.map((description, index) =>   
                <PadBox key={index} horiz={0}>
                        <OneLineTextInput value={description.name || ''} 
                            placeholder={'Cluster ' + (index+1) + ' name'}
                            onChange={text => setClusterDescriptions(clusterDescriptions.map((d, i) => i === index ? {...d, name: text} : d))}
                        />
                </PadBox>
            )}
            <HorizBox>
                <PrimaryButton label="New Cluster" onPress={() => setClusterDescriptions([...clusterDescriptions, {}])} />
            </HorizBox>

            <Separator />
            <OneLineTextInput value={clusterSetName} placeholder='Cluster Set Name' onChange={setClusterSetName} />
            <Pad/>
            <PrimaryButton label="Save as New Cluster Set" onPress={onSave} />
        </ExpandSection>
        <Pad/>
        {inProgress && <QuietSystemMessage label='Computing clusters...' />}
        {!inProgress && <PrimaryButton label="Compute Clusters" onPress={onCompute} />}

    </View>
    
}
