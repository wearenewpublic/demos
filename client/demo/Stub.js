import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export const StubDemo = {
    key: "stub",
    name: "Stub Demo",    
    description: "This demo is just a stub. It does nothing interesting.",
    screen: StubScreen
}

export function StubScreen() {
  return (
    <View style={styles.container}>
      <Text>This demo is just a stub. It does nothing interesting.</Text>
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
