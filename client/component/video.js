import { ResizeMode, Video } from "expo-av"
import { Image, StyleSheet, Text, View } from "react-native"
import { Card, Clickable, TimeText } from "./basics";
import { useRef, useState } from "react";
import { Entypo } from "@expo/vector-icons";
import { UserFace } from "./userface";
import { useObject } from "../util/datastore";


export function VideoPost({post}) {
    const s = VideoPostStyle;
    const user = useObject('persona', post.from);

    return <Card fitted> 
        <View style={s.authorBox}>
            <UserFace userId={post.from} size={32} />
            <View style={s.authorRight}>
                <Text style={s.authorName}>{user.name}</Text>
                <TimeText time={post.time} />
            </View>
        </View>
        <VideoPlayer uri={post.uri} size={200}/>
    </Card>
}

const VideoPostStyle = StyleSheet.create({
    authorBox: {
        flexDirection: 'row',
        marginBottom: 8
    },
    authorRight: {
        flex: 1,
        marginLeft: 8
    },
    authorName: {
        fontSize: 15,
        fontWeight: 'bold'
    }
});

export function VideoPlayer({uri, posterUri, size=200}) {
    const s = VideoPlayerStyle;
    const videoRef = useRef(null);
    const [status, setStatus] = useState({});

    const hasPlayed = status.positionMillis > 0;

    return <View style={{width: size, height: size}}>
        <Video 
            ref={videoRef}             
            source={{uri}}
            resizeMode={ResizeMode.COVER}
            useNativeControls
            videoStyle={{width: size, height: size}}
            style={{width: size, flex: 1}}
            onPlaybackStatusUpdate={status => setStatus(() => status)}
             />
        {!hasPlayed ?
            <View style={s.posterCover}>
                <Clickable onPress={() => videoRef.current.playAsync()}>
                    <Image source={{uri: posterUri}} style={{width: size, height: size}} />     
                    <View style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center'}}>
                        <Entypo name='controller-play' size={size/3} color='white' style={{alignSelf: 'center'}} />
                    </View>
                </Clickable>
            </View>
        : null}
    </View>
}

const VideoPlayerStyle = StyleSheet.create({
    posterCover: {
        position: 'absolute',
        left: 0, right: 0, top: 0, bottom: 0,
    }
})

