import { Image, ScrollView, StyleSheet, View, Text } from "react-native"
import { useGlobalProperty } from "../../util/datastore"
import { BigTitle, BodyText, Center, Clickable, Pad, SmallTitle, SmallTitleLabel, WideScreen } from "../../component/basics"
import { expandUrl } from "../../util/util"
import { FontAwesome } from "@expo/vector-icons"

export const streamRace = "car_racing.jpg"

export function FakeLivestreamScreen({ streamTitle, streamChannel, streamKey, streamChannelIcon, streamDescription }) {
    const s = FakeLivestreamStyle;

    return <View>
        <FakeLivestreamPlayer streamKey={streamKey} />
        <View style={s.streamDetails}>
            <Pad size={24} />
            <BigTitle>{streamTitle}</BigTitle>
            <Pad size={5} />
            <View style={s.streamerInfo}>
                <Image style={s.streamChannelIcon} source={require("../../../public/photos/" + streamChannelIcon)} />
                <SmallTitleLabel label={streamChannel} />
            </View>
            <Pad size={10} />
            <Text style={s.description}>{streamDescription}</Text>
        </View>
    </View>
}

const FakeLivestreamStyle = StyleSheet.create({
    streamDetails: {
        backgroundColor: "#ffeedd",
        // backgroundColor: "#e0ffff",
        // backgroundColor: "#eee",
        paddingBottom: 24,
        paddingHorizontal: 24
    },
    streamerInfo: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    streamChannelIcon: {
        height: 40,
        width: 40,
        borderRadius: "50%",
        marginRight: 10,
    },
    description: {
        width: "100%"
    }
});

function FakeLivestreamPlayer({streamKey}) {
    const s = FakeLivestreamPlayerStyle
    return <View style={s.playerBox}>
        <div style={s.liveSymbol}>LIVE</div>
        <Image style={s.thumb} source={require("../../../public/photos/" + streamKey)}/> 
        <View style={s.centerFrame}>
            <Clickable>
                <FontAwesome name='play-circle' size={128} color='white' style={{opacity: 0.7}}/>
            </Clickable>       
        </View>
    </View>
}

const FakeLivestreamPlayerStyle = StyleSheet.create({
    centerFrame: {
        position: 'absolute',
        left: 0, right: 0, top: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    playerBox: {
        width: "100%",
        alignSelf: 'flex-start'
    },
    thumb: {
        width: "100%",
        height: "50vh",
        objectFit: 'cover'
    },
    liveSymbol: {
        position: 'absolute',
        justifyContent: 'center',
        margin: 10,
        padding: 5,
        zIndex: 10,
        fontFamily: "sans-serif",
        fontWeight: "bold",
        fontSize: 16,
        color: "white",
        backgroundColor: "#FF6666"
    }
})
