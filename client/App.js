import { Text } from 'react-native';
import { demos } from './demo';
import { DemoListScreen } from './shared/DemoListScreen';
import { setUrlPath, useLivePath } from './shared/url';

export default function App() {
  const path = useLivePath();
  const {demoKey, demoInstance} = parsePath(path); 

  function onSelectDemo(newDemoKey) {
    setUrlPath(newDemoKey);
  }

  if (!demoKey) {
    return <DemoListScreen onSelectDemo={onSelectDemo}/>
  } else {
    const demo = chooseDemoByKey(demoKey);
    if (demo) {
      return <demo.screen />
    } else {
      return <Text>Unknown demo key: {demoKey}</Text>
    }
  }
}

function parsePath(path) {
  const components = path.split('/');
  return {
    demoKey: components[1],
    demoInstance: components[2],
    demoComponents: components.slice(3)
  }
}

function chooseDemoByKey(key) {
  return demos.find(demo => demo.key === key);
}
