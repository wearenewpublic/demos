import { StyleSheet, Text, View } from 'react-native';
import { BigTitle, BodyText, Pad, PrimaryButton, SmallTitle } from '../component/basics';
import { useGlobalProperty } from '../util/localdata';
import { callServerApiAsync } from '../util/servercall';
import { useState } from 'react';
import { VideoPlayer } from '../component/video';

export const StubDemo = {
    key: "stub",
    name: "Stub Demo",    
    description: "This demo is just a stub. It does nothing interesting.",
    screen: StubScreen,
    instance: [
        {key: 'silly', name: 'Silly', message: 'I love silliness'},
        {key: 'sensible', name: 'Sensible', message: 'I love sensibleness'}
    ]
}

export function StubScreen() {   
    const s = StubScreenStyle;
    const name = useGlobalProperty('name');
    const [response, setResponse] = useState('');

    async function onCallBackend() {
        const result = await callServerApiAsync('chatgpt', 'hello', {name});
        setResponse(result);
    }

    return (
        <View style={s.container}>
            <BigTitle>{name}</BigTitle>
            <Text style={s.text}>
                This demo is just a stub. This is the {name} instance of this demo, which has 
                different data to the other instances.
            </Text>
            <Pad />
            
            <SmallTitle>Backend Calls</SmallTitle>
            <BodyText> 
                A demo can make calls to a back end. This can be useful for calling APIs like GPT.                   
            </BodyText>
            <Pad />
            <PrimaryButton onPress={onCallBackend}>Call Backend</PrimaryButton>
            <Text style={s.text}>{response}</Text>                

            <SmallTitle>Video</SmallTitle>
            <BodyText>
                Demos can record and play back video.
            </BodyText>

            <VideoPlayer 
                uri='http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' 
                posterUri='https://static.tvtropes.org/pmwiki/pub/images/BigBuckBunny.jpg'
                size={200} />
            <VideoPlayer 
                uri='http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' 
                posterUri='https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_s5_both.jpg/1200px-Elephants_Dream_s5_both.jpg'
                size={200} />
        </View>
    );
}

const StubScreenStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginVertical: 8,
    maxWidth: 500
  }
});
