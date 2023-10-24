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

export const SlackSearchPrototype = {
    name: 'Slack Search',
    author: authorRobEnnals,
    date: '2023-09-12',
    key: 'slacksearch',
    description: 'Search Slack messages by Embeddings, thus testing what embeddings can be good at',
    screen: SlackSearchScreen,
    subscreens: {
        channel: {screen: ChannelScreen, title: 'Channel'},
    },
    newInstanceParams: [
        {key: 'team', name: 'Team Id', type: 'shorttext'},
    ]
}

function SlackSearchScreen() {
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
    const [searchEmbedding, setSearchEmbedding] = useState(null);

    console.log('searchEmbedding', searchEmbedding);

    var sortedMessageKeys;
    if (searchEmbedding) {
        sortedMessageKeys = sortEmbeddingsByDistance(null, searchEmbedding, embeddings).map(x => x.key);
    } else {
        sortedMessageKeys = [];
        // sortedMessageKeys = Object.keys(messages || {}).sort((a, b) => messages[a].ts - messages[b].ts);
    }

    return <SlackContext.Provider value={{users, messages, embeddings}}>
        <SearchBox onNewSearchEmbedding={setSearchEmbedding} />
        <Separator pad={0} />
        <Narrow>
            <ScrollView>
                {sortedMessageKeys.map((messageKey, idx) =>
                    <SlackMessage key={messageKey} messageKey={messageKey} />
                )}
            </ScrollView>
        </Narrow>
        {/* <SlackMessageList sortedMessageKeys={sortedMessageKeys} /> */}
    </SlackContext.Provider>
}

function SearchBox({onNewSearchEmbedding}) {
    const datastore = useDatastore();
    const [search, setSearch] = useState('');

    async function onSearch() {
        const embedding = await callServerApiAsync({datastore, component: 'chatgpt', funcname: 'embedding', params: {text: search}});        
        console.log('embedding', embedding);
        onNewSearchEmbedding(embedding);
    }

    return <Narrow>
        <OneLineTextInput label='Search' placeholder='Search query' value={search} onChange={setSearch} />
        <Pad />
        <PrimaryButton label='Search' onPress={onSearch} />
    </Narrow>
}

