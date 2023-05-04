import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { demos } from './demo';
import { DemoContext } from './shared/DemoContext';
import { DemoInstanceListScreen } from './shared/DemoInstanceListScreen';
import { DemoListScreen } from './shared/DemoListScreen';
import { TopBar } from './shared/TopBar';
import { setUrlPath, useLivePath } from './shared/url';
import { resetData } from './util/localdata';

export default function App() {
  const s = AppStyle;
  const path = useLivePath();
  const {demoKey, instanceKey} = parsePath(path); 
  const demo = chooseDemoByKey(demoKey);

  function onSelectDemo(newDemoKey) {
    setUrlPath(newDemoKey);
  }

  function onSelectInstance(newInstanceKey) {
    setUrlPath(demoKey + '/' + newInstanceKey);
    const instance = chooseInstanceByKey({demo, instanceKey: newInstanceKey});
    resetData(instance)
  }

  if (!demoKey) {
    return <DemoListScreen onSelectDemo={onSelectDemo}/>
  } else if (!demo) {
    return <Text>Unknown demo key: {demoKey}</Text>
  } else if (!instanceKey) {
    return <DemoInstanceListScreen demo={demo} onSelectInstance={onSelectInstance}/>
  } else {
    const instance = chooseInstanceByKey({demo, instanceKey});
    return <DemoContext.Provider value={{demoKey, instance, instanceKey}}>
      <View style={s.fullScreen}>
        <TopBar demo={demo} />
        <demo.screen/>    
      </View>
    </DemoContext.Provider>

  }
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
  return demos.find(demo => demo.key === key);
}

function chooseInstanceByKey({demo, instanceKey}) {
  if (!instanceKey) {
    return null;
  }
  return demo.instance.find(instance => instance.key === instanceKey);
}