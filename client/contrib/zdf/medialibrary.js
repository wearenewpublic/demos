import { Image, ScrollView, StyleSheet, View, Text } from "react-native"
import { BigTitle, Pad, SmallTitleLabel, WideScreen } from "../../component/basics"
import { FontAwesome } from "@expo/vector-icons"
import { Clickable } from "../../component/basics"

export const videoWatercolor = "watercolor_fox.jpg"

export function MediaLibraryPost({primaryVideoTitle, secondaryVideoTitle, videoSummary, videoLength, videoDate, videoKey}) {
    const s = MediaLibraryPostStyle;

    return <WideScreen>
        <ScrollView>
            <BigTitle>{primaryVideoTitle}</BigTitle>
            {
                secondaryVideoTitle ?
                    <>
                        <Pad size={10}/>
                        <SmallTitleLabel label={secondaryVideoTitle}/>
                    </>
                    : null
            }
            <FakeVideoPlayer videoKey={videoKey} />
            <View style={s.description}>
                <Text style={s.videoDescription}>{videoSummary}</Text>
                <Pad size={24} />
                <View style={s.time}>
                    <Text style={s.videoDescription}>{videoLength}</Text>
                    <Text style={s.videoDescription}> | </Text>
                    <Text style={s.videoDescription}>{videoDate}</Text>
                </View>
            </View>
            <Pad size={24}/>
        </ScrollView>
    </WideScreen>
}

const MediaLibraryPostStyle = StyleSheet.create({
    description: {
        backgroundColor: "#e6e9f0",
        padding: 24,
        width: 800,
        alignSelf: "center"
    },
    time: {
        display: "flex",
        flexDirection: "row"
    },
        videoDescription: {
        fontSize: 15,
        color: '#444'
    }
});

function FakeVideoPlayer({videoKey}) {
    const s = FakeVideoPlayerStyle
    return <View style={s.videoBox}>
        <Image style={s.videoThumb} source={require("../../../public/photos/" + videoKey)}/> 
        <View style={s.centerFrame}>
            <Clickable>
                <FontAwesome name='play-circle' size={128} color='white' style={{opacity: 0.7}}/>
            </Clickable>       
        </View>
    </View>
}

const FakeVideoPlayerStyle = StyleSheet.create({
    centerFrame: {
        position: 'absolute',
        left: 0, right: 0, top: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    videoBox: {
        width: 800,
        marginTop: 16,
        alignSelf: 'center'
    },
    videoThumb: {
        width: 800,
        height: 400,
        objectFit: 'cover'
    }
})
