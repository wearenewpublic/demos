import { ResizeMode, Video } from "expo-av"
import { Image, StyleSheet, View } from "react-native"
import { Clickable } from "./basics";
import { useRef, useState } from "react";
import { Entypo } from "@expo/vector-icons";

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

