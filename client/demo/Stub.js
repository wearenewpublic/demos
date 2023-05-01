import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { BigTitle } from '../component/basics';

export const StubDemo = {
    key: "stub",
    name: "Stub Demo",    
    description: "This demo is just a stub. It does nothing interesting. \nClick on a particular instance of this demo that you want to use for user testing.",
    screen: StubScreen,
    instance: [
        {key: 'silly', name: 'Silly'},
        {key: 'sensible', name: 'Sensible'}
    ]
}

export function StubScreen({instance}) {
  return (
    <View style={styles.container}>
        <BigTitle>{instance.name}</BigTitle>
        <Text style={{maxWidth: 500}}>
            This demo is just a stub. This is the {instance.name} instance of this demo, which has 
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
