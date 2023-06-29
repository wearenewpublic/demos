import React from 'react';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { prototypes } from './prototype';
import { PrototypeContext } from './organizer/PrototypeContext';
import { PrototypeInstanceListScreen } from './organizer/PrototypeInstanceListScreen';
import { PrototypeListScreen } from './organizer/PrototypeListScreen';
import { TopBar } from './organizer/TopBar';
import { resetData } from './util/localdata';
import { useFonts, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { setTitle } from './platform-specific/url';
import { gotoUrl, useLiveUrl } from './organizer/url';
import { getScreenStackForUrl, gotoPrototype, gotoInstance } from './util/navigate';
import { LoginScreen } from './organizer/Login';
import { useFirebaseUser } from './util/firebase';
import { Datastore } from './util/datastore';


export default function App() {
  const url = useLiveUrl();
  const {prototypeKey, instanceKey, screenStack} = getScreenStackForUrl(url);
  const prototype = choosePrototypeByKey(prototypeKey);
  let [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
  });

  function onSelectPrototype(prototype) {
    gotoPrototype(prototype.key);
  }

  function onSelectInstance(newInstanceKey) {
    gotoInstance(prototypeKey, newInstanceKey);
    const instance = chooseInstanceByKey({prototype, instanceKey: newInstanceKey});
    resetData(instance)
  }

  if (!prototypeKey) {
    setTitle('New Public Prototype Garden')
    return <FullScreen backgroundColor='hsl(218, 100%, 96%)'>
      <PrototypeListScreen onSelectPrototype={onSelectPrototype}/>
    </FullScreen>
  } else if (!prototype) {
    return <FullScreen>
      <TopBar title='Unknown Prototype' />
      <Text>Unknown prototype: {prototypeKey}</Text>
    </FullScreen>
  } else if (!instanceKey) {
    return <FullScreen backgroundColor='hsl(218, 100%, 96%)'>
      <TopBar title={prototype.name} />
      <PrototypeInstanceListScreen prototype={prototype} onSelectInstance={onSelectInstance}/>
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
  const {prototypeKey, instanceKey, screenKey, params} = screenInstance;
  // const fbUser = useFirebaseUser();

  if (prototypeKey == 'login' || instanceKey == 'login' || screenKey == 'login') {
    return <FullScreen zIndex={index}>
        <TopBar title='Log In' />
        <LoginScreen />
    </FullScreen>
  }

  const prototype = choosePrototypeByKey(prototypeKey);
  const instance = chooseInstanceByKey({prototype, instanceKey});
  const screen = getScreen({prototype, screenKey, instanceKey});
  const title = getScreenTitle({prototype, screenKey, instance, params}); 

  return <PrototypeContext.Provider value={{prototypeKey, instance, instanceKey}}>
    <Datastore instance={instance} instanceKey={instanceKey} prototypeKey={prototypeKey} isLive={instance.isLive}>
      <FullScreen zIndex={index}>
        <TopBar title={title} params={params} subtitle={prototype.name} showPersonas={!instance.isLive} />
        {React.createElement(screen, params)}
      </FullScreen>
    </Datastore>
  </PrototypeContext.Provider>
}

function getScreen({prototype, screenKey}) {
  if (!screenKey) {
    return prototype.screen;
  } else {
    return prototype.subscreens?.[screenKey]?.screen;
  }
}

function getScreenTitle({prototype, instance, screenKey, params}) {
  if (screenKey) {
    const title = prototype.subscreens?.[screenKey]?.title;
    if (typeof(title) == 'string') {
      return title;
    } else {
      return React.createElement(prototype.subscreens?.[screenKey]?.title, params);
    }
  } else if (instance) {
    return instance.name;
  } else {
    return prototype.name
  }
}


function FullScreen({children, zIndex=0, backgroundColor='white'}) {
  return <View style={[AppStyle.fullScreen, {zIndex, backgroundColor}]}>{children}</View>
}

const AppStyle = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    // backgroundColor: 'white',
  }
})

function choosePrototypeByKey(key) {
  if (!key) return null;
  return prototypes.find(prototype => prototype.key === key);
}

function chooseInstanceByKey({prototype, instanceKey}) {
  if (!instanceKey) {
    return null;
  }
  const rolePlayInstance = prototype.instance?.find(instance => instance.key === instanceKey);
  if (rolePlayInstance) {
    return rolePlayInstance;
  } else {
    const liveInstance = prototype.liveInstance?.find(instance => instance.key === instanceKey);
    return {...liveInstance, isLive: true};
  }
}


