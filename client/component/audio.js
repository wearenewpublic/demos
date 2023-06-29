import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BodyText, Card, Clickable, TimeText } from './basics';
import { Entypo, FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { callServerMultipartApiAsync } from '../util/servercall';
// import { useObject } from '../util/localdata';
import { UserFace } from './userface';
import { useObject } from '../util/datastore';


export function AudioPost({post}) {
    const s = AudioPostStyle;
    const user = useObject('persona', post.from);
    return <Card fitted>
        <View style={s.authorBox}>
            <UserFace userId={post.from} size={32} />
            <View style={s.authorRight}>
                <Text style={s.authorName}>{user?.name}</Text>
                <TimeText time={post.time} />
            </View>
        </View>
        <Text style={s.text}>{post.text}</Text>
        <AudioPlayer uri={post.uri} size={200} pill label='Play Audio Response'/>
    </Card>
}

const AudioPostStyle = StyleSheet.create({
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
    },
    text: {
        marginHorizontal: 2,
        marginBottom: 12,
        color: '#444'

    }
})



export function AudioPlayer({uri, pill=false, label='Play Audio'}) {
    const s = AudioPlayerStyle;
    const [sound, setSound] = useState();
    const [playing, setPlaying] = useState(false);

    async function onPlay(){
        setPlaying(true);
        const {sound} = await Audio.Sound.createAsync(uri);
        setSound(sound);
        console.log('playing', sound, uri);
        sound.playAsync();
    }

    async function onPause() {
        setPlaying(false);
        sound.pauseAsync();
    }

    React.useEffect(() => {
        return sound
          ? () => {
              console.log('Unloading Sound');
              sound.unloadAsync();
            }
          : undefined;
      }, [sound]);

    if (pill) {
        return <Clickable onPress={playing ? onPause : onPlay}>
            <View style={s.pill}> 
                <View style={s.outer}>
                    <FontAwesome name={playing ? 'pause-circle' : 'play-circle'} size={24} color='#666' />
                </View>
                <Text style={s.label}>{label}</Text>
            </View>
        </Clickable>
        
    } else {
        return <View style={s.outer}>
            <Clickable onPress={playing ? onPause : onPlay}>
                <FontAwesome name={playing ? 'pause-circle' : 'play-circle'} size={32} color='#666' />
            </Clickable>
        </View>
    }
}

const AudioPlayerStyle = StyleSheet.create({
    button: {
        padding: 4,
        borderRadius: 16,
        alignItems: 'center',
        alignSelf: 'flex-start',
        textAlign: 'center',
        borderColor: '#ddd',
        borderWidth: StyleSheet.hairlineWidth
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ddd',
        borderWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 24,
        alignSelf: 'flex-start'
    },
    label: {
        fontSize: 15,
        color: '#444',
        marginLeft: 8,
        marginRight: 6
    }
})


export async function transcribeAudioAsync({blob}) {
    const result = await callServerMultipartApiAsync('whisper', 'transcribeAudio', {}, {
        audioFile: {blob, filename: 'audio.webm'}
    });
    return result.text;

}