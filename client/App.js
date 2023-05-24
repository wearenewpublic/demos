import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { demos } from './demo';
import { DemoContext } from './shared/DemoContext';
import { DemoInstanceListScreen } from './shared/DemoInstanceListScreen';
import { DemoListScreen } from './shared/DemoListScreen';
import { TopBar } from './shared/TopBar';
import { setUrlPath, useLivePath } from './shared/url';
import { resetData } from './util/localdata';
import { useFonts, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { setTitle } from './platform-specific/url';


export default function App() {
  const path = useLivePath();
  const {demoKey, instanceKey} = parsePath(path); 
  const demo = chooseDemoByKey(demoKey);
  let [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
  });

  function onSelectDemo(demo) {
    setUrlPath(getKeyForDemo(demo));
  }

  function onSelectInstance(newInstanceKey) {
    setUrlPath(demoKey + '/' + newInstanceKey);
    const instance = chooseInstanceByKey({demo, instanceKey: newInstanceKey});
    resetData(instance)
  }

  if (!demoKey) {
    setTitle('New Public Demo Garden')
    return <FullScreen>
      <DemoListScreen onSelectDemo={onSelectDemo}/>
    </FullScreen>
  } else if (!demo) {
    return <FullScreen>
      <TopBar title='Unknown Demo' />
      <Text>Unknown demo: {demoKey}</Text>
    </FullScreen>
  } else if (!instanceKey) {
    return <FullScreen>
      <TopBar title={demo.name} />
      <DemoInstanceListScreen demo={demo} onSelectInstance={onSelectInstance}/>
    </FullScreen>
  } else {
    const instance = chooseInstanceByKey({demo, instanceKey});
    return <DemoContext.Provider value={{demoKey, instance, instanceKey}}>
      <FullScreen>
        <TopBar title={instance.name} subtitle={demo.name} showPersonas />
        <demo.screen/>    
      </FullScreen>
    </DemoContext.Provider>

  }
}

function FullScreen({children}) {
  return <View style={AppStyle.fullScreen}>{children}</View>
}

const AppStyle = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0
  }
})

function parsePath(path) {
  const components = path.split('/');
  return {
    demoKey: components[1],
    instanceKey: components[2],
    demoComponents: components.slice(3)
  }
}

function chooseDemoByKey(key) {
  if (!key) return null;
  return demos.find(demo => getKeyForDemo(demo) === key);
}

function chooseInstanceByKey({demo, instanceKey}) {
  if (!instanceKey) {
    return null;
  }
  return demo.instance.find(instance => instance.key === instanceKey);
}

function getKeyForDemo(demo) {
  return demo.key
}

