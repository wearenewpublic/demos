import { StyleSheet, Text, View } from 'react-native';
import { BigTitle, PrimaryButton } from '../component/basics';
import { useGlobalProperty } from '../util/localdata';
import { callServerApiAsync } from '../util/servercall';
import { useState } from 'react';

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
            <PrimaryButton onPress={onCallBackend}>Call Backend</PrimaryButton>
            <Text style={s.text}>{response}</Text>
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
