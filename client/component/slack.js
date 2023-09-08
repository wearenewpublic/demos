import React, { useContext } from "react";

import { Image, StyleSheet, Text, View } from "react-native";
import { BodyText, HorizBox, MaybeClickable } from "./basics";
import { callServerApiAsync } from "../util/servercall";
import { AnonymousFace } from "./userface";

export const SlackContext = React.createContext();

export function SlackMessage({messageKey, onPress}) {
    const s = SlackMessageStyle;
    const {users, messages} = useContext(SlackContext);
    const message = messages[messageKey];
    const user = users[message.user];
    return <MaybeClickable onPress={onPress} isClickable={onPress} hoverStyle={s.hover}> 
        <View style={s.outer}>
            <SlackUserFace userKey={message.user} />
            <View style={s.right}>
                <Text style={s.userName}>{user?.name}</Text>
                <BodyText>{replaceUserMentions({text: message?.text, users})}</BodyText>
            </View>
        </View>
    </MaybeClickable>
}

const SlackMessageStyle = StyleSheet.create({
    outer: {
        marginVertical: 8,
        flexDirection: 'row'
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
