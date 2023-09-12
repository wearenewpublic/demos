import React, { useContext, useEffect, useState } from "react";

import { Image, StyleSheet, Text, View } from "react-native";
import { BodyText, Card, HorizBox, LoadingScreen, MaybeClickable, Narrow, SmallTitle, TimeText } from "./basics";
import { callServerApiAsync } from "../util/servercall";
import { AnonymousFace } from "./userface";
import { useDatastore, useGlobalProperty } from "../util/datastore";
import { mapKeys } from "../util/util";
import { BottomScroller } from "../platform-specific/bottomscroller";

export const SlackContext = React.createContext();

const slackTimeFormat = 
{
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
}

export function SlackMessage({prevMessageKey, messageKey, authorLineWidget=null, onPress}) {
    const s = SlackMessageStyle;
    const {users, messages} = useContext(SlackContext);
    const message = messages[messageKey];
    const prevMessage = messages?.[prevMessageKey];
    const user = users[message.user];
    const sameDay = prevMessage && (new Date(parseFloat(prevMessage.ts) * 1000)).toDateString() == (new Date(parseFloat(message.ts) * 1000)).toDateString();
    // console.log('sameDay', sameDay, {prevMessage, message, prevTime: prevMessage?.ts, time: message.ts});
    const time = new Date(parseFloat(message.ts) * 1000);
    return <View>
        {sameDay ? null : <DayDivider time={time} />}
        <MaybeClickable onPress={onPress} isClickable={onPress} hoverStyle={s.hover}> 
            <View style={s.outer}>
                <SlackUserFace userKey={message.user} />
                <View style={s.right}>
                    <View style={s.authorLine}>
                        <Text style={s.userName}>{user?.name}</Text>
                        <Text style={s.time}>{time.toLocaleTimeString('en-US', slackTimeFormat)}</Text>
                        {authorLineWidget ? 
                            React.createElement(authorLineWidget, {message, messageKey})
                        : null}
                    </View>  
                    <BodyText>{replaceUserMentions({text: message?.text, users})}</BodyText>
                </View>
            </View>
        </MaybeClickable>
    </View>
}

const SlackMessageStyle = StyleSheet.create({
    outer: {
        marginVertical: 8,
        flexDirection: 'row'
    },
    authorLine: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    time: {
        marginLeft: 8,
        color: '#999',
        fontSize: 13,
    },
    hover: {
        backgroundColor: '#eee'
    },
    userName: {
        fontWeight: 'bold'
    },
    right: {
        marginLeft: 8,
        flex: 1
    }
})


const currentYear = new Date().getFullYear();

const sameYearDateFormat = {
    weekday: 'short',
    month: 'long',
    day: 'numeric'
};
const differentYearDateFormat = {
    weekday: 'short',
    month: 'long',
    day: 'numeric'
};


function DayDivider({time}) {
    const s = DayDividerStyle;
    const sameYear = time.getFullYear() == currentYear;
    return (
        <View style={s.outer}>
            <View style={s.inner}>
                <Text style={s.text}>{time.toLocaleDateString('en-US', sameYear ? sameYearDateFormat : differentYearDateFormat)}</Text>
            </View>
            <View style={s.separator} />
        </View>
    );
}

const DayDividerStyle = StyleSheet.create({
    outer: {
        marginVertical: 16,
        alignItems: 'center',
        position: 'relative' // Added this to act as a reference for the absolute positioned separator
    },
    inner: {
        borderWidth: 1,
        borderColor: '#ddd',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 16,
        zIndex: 1, // ensure the pill is above the separator line
        backgroundColor: 'white', // ensure text is not overlapped by separator
    },
    text: {
        fontWeight: 'bold'
     },
    separator: {
        position: 'absolute',
        top: '50%', // center the separator vertically
        left: 0,
        right: 0,
        height: 1, // the height of the separator
        backgroundColor: '#ddd',
        zIndex: 0, // ensure the separator is below the pill
    },
});

export default DayDivider;


export function SlackUserFace({userKey}) {
    const s = SlackUserFaceStyle;
    const {users} = useContext(SlackContext);
    const user = users[userKey];    
    if (user && user.image) {
        return <Image source={{uri: user.image}} style={s.image} />
    } else {
        return <AnonymousFace size={40} />
    }   
}

const SlackUserFaceStyle = StyleSheet.create({
    image: {
        width: 40,
        height: 40,
        borderRadius: 4,
    }
})


export function SlackChannelList({onPressChannel}) {
    const channels = useSlackChannels();

    if (!channels) {
        return <LoadingScreen />
    }

    return <View>
        {mapKeys(channels, (channelKey, channelInfo) =>
            <SlackChannel key={channelKey} channelKey={channelKey} channelInfo={channelInfo} onPressChannel={onPressChannel} />
        )}
    </View>
}

function SlackChannel({channelKey, channelInfo, onPressChannel}) {
    return <Card onPress={() => onPressChannel({channelKey})}>
        <SmallTitle>#{channelInfo.name}</SmallTitle>
    </Card>
}

export function SlackMessagesWithInfoPanel({messages, infoPanel, authorLineWidget=null}) {
    const [selectedMessage, setSelectedMessage] = useState(null);
    const sortedMessageKeys = Object.keys(messages || {}).sort((a, b) => messages[a].ts - messages[b].ts);

    return <View style={{flex: 1, flexDirection: 'row'}}>
        <View style={{flex: 1}}>
            <BottomScroller>
                <Narrow>
                    {sortedMessageKeys.map((messageKey, idx) =>
                        <SlackMessage key={messageKey}
                            authorLineWidget={authorLineWidget}
                            messageKey={messageKey}
                            prevMessageKey={sortedMessageKeys[idx - 1]} 
                            onPress={() => setSelectedMessage(messageKey)} />
                    )}
                </Narrow>
            </BottomScroller>
        </View>
        {
            React.createElement(infoPanel, {messageKey: selectedMessage})
        }
    </View>
    
}


var global_embedding_data = {}

export function useSlackEmbeddings(path) {
    const team = useGlobalProperty('team');
    const datastore = useDatastore();
    const [data, setData] = useState(global_embedding_data[path]);
    useEffect(() => {
        if (!data && team) {
            getSlackEmbeddingsAsync({datastore, team, path}).then(data => {
                global_embedding_data[path] = data;
                setData(data);
            });
        }
    }, [team, path]);
    return data;
}

export function useSlackMessageEmbeddings({channelKey}) {
    return channelKey && useSlackEmbeddings('channel/' + channelKey + '/messageEmbedding');
}


var global_slack_data = {};

export function useSlackContent(path) {
    const team = useGlobalProperty('team');
    const datastore = useDatastore();
    const [data, setData] = useState(global_slack_data[path]);
    useEffect(() => {
        if (!data && team) {
            getSlackContentAsync({datastore, team, path}).then(data => {
                global_slack_data[path] = data;
                setData(data);
            });
        }
    }, [team, path]);
    return data;
}

export function useSlackChannels() {
    return useSlackContent('channelInfo');
}
    

export function useSlackMessages({channelKey}) {
    return useSlackContent('channel/' + channelKey + '/message');
}

export function useSlackUsers() {
    return useSlackContent('users');
}

export async function getSlackContentAsync({datastore, team, path}) {
    return callServerApiAsync({datastore, component: 'slack', funcname: 'getContent', params: {team, path}});
}

export async function getSlackEmbeddingsAsync({datastore, team, path}) {
    return callServerApiAsync({datastore, component: 'slack', funcname: 'getEmbeddings', params: {team, path}});
}

export async function getSlackUsers({datastore, team}) {
    return getSlackContentAsync({datastore, team, path: 'users'});
}

export async function getSlackMessages({datastore, team, channel}) {
    return getSlackContentAsync({datastore, team, path: 'channel/' + channel + '/message'});
}

export async function getSlackMessageEmbeddings({datastore, team, channel}) {
    return getSlackEmbeddingsAsync({datastore, team, path: 'channel/' + channel + '/messageEmbedding'});
}

export async function getSlackChannels({datastore, team}) {
    return getSlackContentAsync({datastore, team, path: 'channelInfo'});
}

export function replaceUserMentions({text, users}) {
    return text.replace(/<@(\w+)>/g, (match, userId) => {
      return ('@' + users[userId]?.name) || match; // Use the original match if the user ID is not found in the mapping
    });
}

// const slackLinkRegex = /<https?:\/\/[^|]+?\|[^>]+?>/g
const slackLinkRegex = /<https?:\/\/[^|>]+?(?:\|[^>]+?)?>/g


export function replaceLinks({text}) {
    return text.replace(slackLinkRegex, (match, link) => {
        return '<link>';
    });
}
