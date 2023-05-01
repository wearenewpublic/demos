import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { BigTitle } from '../component/basics';
import { useGlobalProperty } from '../util/localdata';

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
    const name = useGlobalProperty('name');
    return (
        <View style={styles.container}>
            <BigTitle>{name}</BigTitle>
            <Text style={{maxWidth: 500}}>
                This demo is just a stub. This is the {name} instance of this demo, which has 
                different data to the other instances.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
