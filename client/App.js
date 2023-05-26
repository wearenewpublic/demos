import React from 'react';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { demos } from './demo';
import { DemoContext } from './shared/DemoContext';
import { DemoInstanceListScreen } from './shared/DemoInstanceListScreen';
import { DemoListScreen } from './shared/DemoListScreen';
import { TopBar } from './shared/TopBar';
import { resetData } from './util/localdata';
import { useFonts, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { setTitle } from './platform-specific/url';
import { gotoUrl, useLiveUrl } from './shared/url';
import { getScreenStackForUrl, gotoDemo, gotoInstance } from './shared/navigate';


export default function App() {
  const url = useLiveUrl();
  const {demoKey, instanceKey, screenStack} = getScreenStackForUrl(url);
  const demo = chooseDemoByKey(demoKey);
  let [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
  });

  function onSelectDemo(demo) {
    gotoDemo(demo.key);
  }

  function onSelectInstance(newInstanceKey) {
    gotoInstance(demoKey, newInstanceKey);
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
    return <ScreenStack screenStack={screenStack} />
  }
}


function ScreenStack({screenStack}) {
  const s = ScreenStackStyle;
  return <View style={s.stackHolder}>
    {screenStack.map((screenInstance, index) => 
      <StackedScreen screenInstance={screenInstance} index={index} key={index} />
    )}
  </View>
}

const ScreenStackStyle = StyleSheet.create({
  stackHolder: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'white',
  }
})


function StackedScreen({screenInstance, index}) {
  const {demoKey, instanceKey, screenKey, params} = screenInstance;
  const demo = chooseDemoByKey(demoKey);
  const instance = chooseInstanceByKey({demo, instanceKey});
  const screen = getScreen({demo, screenKey});
  const title = getScreenTitle({demo, screenKey, params}); 

return <DemoContext.Provider value={{demoKey, instance, instanceKey}}>
      <FullScreen zIndex={index}>
        <TopBar title={title} subtitle={demo.name} showPersonas />
        {React.createElement(screen, params)}
      </FullScreen>
    </DemoContext.Provider>
}

function getScreen({demo, screenKey}) {
  if (!screenKey) {
    return demo.screen;
  } else {
    return demo.subscreens?.[screenKey]?.screen;
  }
}

function getScreenTitle({demo, screenKey, params}) {
  if (!screenKey) {
    return demo.name;
  } else {
    return demo.subscreens?.[screenKey]?.title?.(params)
  }
}


function FullScreen({children, zIndex=0}) {
  return <View style={[AppStyle.fullScreen, {zIndex}]}>{children}</View>
}

const AppStyle = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'white',
  }
})

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


