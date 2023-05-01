import { Text } from 'react-native';
import { demos } from './demo';
import { DemoInstanceListScreen } from './shared/DemoInstanceListScreen';
import { DemoListScreen } from './shared/DemoListScreen';
import { setUrlPath, useLivePath } from './shared/url';

export default function App() {
  const path = useLivePath();
  const {demoKey, instanceKey} = parsePath(path); 
  const demo = chooseDemoByKey(demoKey);

  console.log('App', {path, demoKey, instanceKey, demo})

  function onSelectDemo(newDemoKey) {
    setUrlPath(newDemoKey);
  }

  function onSelectInstance(newInstanceKey) {
    setUrlPath(demoKey + '/' + newInstanceKey);
  }

  if (!demoKey) {
    return <DemoListScreen onSelectDemo={onSelectDemo}/>
  } else if (!demo) {
    return <Text>Unknown demo key: {demoKey}</Text>
  } else if (!instanceKey) {
    return <DemoInstanceListScreen demo={demo} onSelectInstance={onSelectInstance}/>
  } else {
    const instance = chooseInstanceByKey({demo, instanceKey});
    return <demo.screen instance={instance} />    
  }
}

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