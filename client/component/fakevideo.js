import { Image, ScrollView, StyleSheet, View } from "react-native"
import { useGlobalProperty } from "../util/datastore"
import { Center, Pad, SmallTitle, SmallTitleLabel, WideScreen } from "./basics"
import { expandUrl } from "../util/util"
import { FontAwesome } from "@expo/vector-icons"

export const videoGodzilla = 'godzilla_new_york.jpeg'
export const videoTrekWars = 'trek_wars_brawl.jpeg'
export const videoLizard = 'lizard.jpeg'
export const videoKingKong = 'king_kong_toronto.jpeg'
export const videoMotorcyle = 'motorcycle.jpeg'

export const videos = {
    godzilla: videoGodzilla,
    trekwars: videoTrekWars,
    lizard: videoLizard,
    kingkong: videoKingKong,
    motorcycle: videoMotorcyle,
}

export function FakeVideoScreen({articleChildLabel, children}) {
    const videoKey = useGlobalProperty('videoKey');
    const title = useGlobalProperty('title');

    return <WideScreen pad>
        <ScrollView>
            <FakeVideoPlayer videoKey={videoKey} />
            <Pad size={24} />
            <Center><SmallTitleLabel label={articleChildLabel} /></Center>
            {children}
            <Pad size={32} />
        </ScrollView>
    </WideScreen>
}

function FakeVideoPlayer({videoKey}) {
    const s = FakeVideoPlayerStyle
    return <View style={s.videoBox}>
        <Image style={s.videoThumb} source={{uri: expandUrl({url: videoKey, type: 'photos'})}}/> 
        <View style={s.centerFrame}>
            <FontAwesome name='play-circle' size={128} color='white' style={{opacity: 0.7}}/>
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
        objectFit: 'cover',
    }

})
