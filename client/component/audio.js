import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Clickable } from './basics';
import { Entypo, FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';


export function AudioPlayer({uri}) {
    const s = AudioPlayerStyle;
    const [sound, setSound] = React.useState();
    const [playing, setPlaying] = React.useState(false);

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

    return <View style={s.outer}>
        <Clickable onPress={playing ? onPause : onPlay}>
            <FontAwesome name={playing ? 'pause-circle' : 'play-circle'} size={32} color='#666' />
        </Clickable>
    </View>
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
    }
})
