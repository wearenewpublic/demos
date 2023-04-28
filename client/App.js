import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { demos } from './demo';
import { DemoListScreen } from './shared/DemoListScreen';
import { historyPushState, watchPopState } from './util/shim';
import * as Linking from 'expo-linking';

export default function App() {
  const initialUrl = Linking.useURL();
  const [url, setUrl] = useState(null);
  const selectedDemoKey = getDemoKeyForUrl(url || initialUrl);

  useEffect(() => {
    watchPopState(() => {
      setUrl(window.location.href);      
    })
  }, []);

  function onSelectDemo(demoKey) {
    historyPushState({state: {demoKey}, url: `/${demoKey}`});
    setUrl(window.location.href);
  }

  if (selectedDemoKey == null) {
    return null;
  } else if (!selectedDemoKey) {
    return <DemoListScreen onSelectDemo={onSelectDemo}/>
  } else {
    const selectedDemo = chooseDemoByKey(selectedDemoKey);
    if (selectedDemo) {
      return <selectedDemo.screen />
    } else {
      return <Text>Unknown demo key: {selectedDemoKey}</Text>
    }
  }
}


function getDemoKeyForUrl(url) {
  if (!url) return null;
  const path = new URL(url).pathname;
  const components = path.split('/');
  return components[1]
}

function chooseDemoByKey(key) {
  return demos.find(demo => demo.key === key);
}
