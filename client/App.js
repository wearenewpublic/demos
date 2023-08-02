import React, { useTransition } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { prototypes } from './prototype';
import { PrototypeContext } from './organizer/PrototypeContext';
import { PrototypeInstanceListScreen } from './organizer/PrototypeInstanceListScreen';
import { PrototypeListScreen } from './organizer/PrototypeListScreen';
import { TopBar } from './organizer/TopBar';
import { useFonts, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { getIsLocalhost, setTitle } from './platform-specific/url';
import { useLiveUrl } from './organizer/url';
import { getScreenStackForUrl, gotoPrototype, gotoInstance } from './util/navigate';
import { LoginScreen } from './organizer/Login';
import { Datastore, useGlobalProperty } from './util/datastore';
import { NewLiveInstanceScreen } from './organizer/NewLiveInstance';
import { ScreenTitleText } from './component/basics';
import { MembersScreen } from './component/members';


export default function App() {
  const url = useLiveUrl();
  const {prototypeKey, instanceKey, screenStack} = getScreenStackForUrl(url);
  const prototype = choosePrototypeByKey(prototypeKey);
  let [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
  });

  function onSelectInstance(newInstanceKey) {
    gotoInstance({prototypeKey, instanceKey: newInstanceKey});
  }

  if (!prototypeKey) {
    return <FullScreen>
      <Text>You need a prototype URL to see a prototype</Text>
    </FullScreen>
  } else if (prototypeKey == 'all' && getIsLocalhost()) {
    setTitle('Prototype Organizer')
    return <FullScreen backgroundColor='hsl(218, 100%, 96%)'>
      <PrototypeListScreen onSelectPrototype={newPrototype => gotoPrototype(newPrototype.key)}/>
    </FullScreen>
  } else if (!prototype) {
    return <FullScreen>
      <TopBar title='Unknown Prototype' />
      <Text>Unknown prototype: {prototypeKey}</Text>
    </FullScreen>
  } else if (!instanceKey) {
    return <FullScreen backgroundColor='hsl(218, 100%, 96%)'>
      <TopBar title={prototype.name} showBack={false} />
      <PrototypeInstanceListScreen prototype={prototype} onSelectInstance={onSelectInstance}/>
    </FullScreen>
  } else if (instanceKey == 'new') {
    return <FullScreen backgroundColor='hsl(218, 100%, 96%)'>
      <TopBar title='New Live Instance' subtitle={prototype.name} />
      <NewLiveInstanceScreen prototype={prototype} />
    </FullScreen>
  } else {
    return <ScreenStack screenStack={screenStack} prototypeKey={prototypeKey} instanceKey={instanceKey} />
  }
}


function ScreenStack({screenStack, prototypeKey, instanceKey}) {
  const s = ScreenStackStyle;
  const prototype = choosePrototypeByKey(prototypeKey);
  const instance = chooseInstanceByKey({prototype, instanceKey});
  return <View style={s.stackHolder}>
    <PrototypeContext.Provider value={{prototype, prototypeKey, instance, instanceKey}}>
      <Datastore instance={instance} instanceKey={instanceKey} prototype={prototype} prototypeKey={prototypeKey} isLive={instance.isLive}>
        {screenStack.map((screenInstance, index) => 
          <StackedScreen screenInstance={screenInstance} index={index} key={index} />
        )}
      </Datastore>
    </PrototypeContext.Provider>
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

  if (prototypeKey == 'login' || instanceKey == 'login' || screenKey == 'login') {
    return <FullScreen zIndex={index}>
        <TopBar title='Log In' />
        <LoginScreen />
    </FullScreen>
  }

  const prototype = choosePrototypeByKey(prototypeKey);
  const instance = chooseInstanceByKey({prototype, instanceKey});
  const screenSet = {...defaultScreens, ...prototype.screens};

  var screen = getScreen({screenSet, prototype, screenKey, instanceKey});
  var title = getScreenTitle({screenSet, prototype, screenKey, instance, params}); 

  if (!screen) {
    return null;
  }

  return <FullScreen zIndex={index}>
    <TopBar title={title} params={params} subtitle={prototype.name} showPersonas={!instance.isLive} />
      {React.createElement(screen, params)}
  </FullScreen>  
}


const defaultScreens = {
  members: {screen: MembersScreen, title: 'Members'}
}

function getScreen({screenSet, prototype, screenKey}) {
  if (!screenKey) {
    return prototype.screen;
  } else {
    return screenSet[screenKey]?.screen;
  }
}

function getScreenTitle({screenSet, prototype, instance, screenKey, params}) {
  const name = useGlobalProperty('name');
  if (screenKey) {
    const title = screenSet?.[screenKey]?.title;
    if (typeof(title) == 'string') {
      return title;
    } else if (title) {
      return React.createElement(title, params);
    } else {
      return null;
    }
  } else if (instance) {
    return name;
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


