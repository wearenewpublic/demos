
import React, { useEffect, useState } from 'react';
import { defaultPersona, defaultPersonaList, personaListToMap } from '../data/personas';
import { firebaseNewKey, firebaseWatchValue, firebaseWriteAsync, getFirebaseUser, onFbUserChanged } from './firebase';
import { deepClone } from './util';
import { Text } from 'react-native';
import { LoadingScreen } from '../component/basics';

const DatastoreContext = React.createContext({});

// TODO: Make this more efficient: Currently every data update updates everything.

export class Datastore extends React.Component {
    state = {loaded: false}

    dataTree = {};
    sessionData = {};

    dataWatchers = [];
    fbUserWatchReleaser = null;
    fbDataWatchReleaser = null;

    componentDidMount() {
        this.resetData();
        if (this.props.isLive) {
            this.fbWatchReleaser = onFbUserChanged(user => {
                this.setSessionData('personaKey', user.uid);
            })
        }
        if (!this.props.isLive) {
            this.setState({loaded: true});
        }
    }
    componentWillUnmount() {
        this.fbUserWatchReleaser && this.fbUserWatchReleaser();
        this.fbDataWatchReleaser && this.fbDataWatchReleaser();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.instanceKey != this.props.instanceKey || prevProps.prototypeKey != this.props.prototypeKey) {
            this.resetData();
        }
    }

    resetData() {
        const {instance, instanceKey, prototypeKey, isLive} = this.props;

        const personaKey = getInitialPersonaKey(instance);
        this.dataTree = {
            persona: personaListToMap(instance.personaList || defaultPersonaList),
            ...deepClone(instance)
        }
        this.sessionData = {personaKey}
        this.notifyWatchers();
        if (isLive) {
            this.fbDataWatchReleaser && this.fbDataWatchReleaser();
            this.fbDataWatchReleaser = firebaseWatchValue(['prototype', prototypeKey, 'instance', instanceKey], data => {
                this.dataTree = {...this.dataTree, ...data?.collection, ...data?.global};
                // console.log('datatree', this.dataTree);
                this.notifyWatchers();
                this.setState({loaded: true})
            });
        }
    }

    watch(watchFunc) {
        this.dataWatchers.push(watchFunc);
    }
    unwatch(watchFunc) {
        this.dataWatchers = this.dataWatchers.filter(w => w !== watchFunc);
    }
    notifyWatchers() {
        this.dataWatchers.forEach(w => w());
    }

    setSessionData(path, value) {
        this.sessionData = {...this.sessionData, [pathToName(path)]: value};
        this.notifyWatchers();
    }
    getSessionData(path) {
        return this.sessionData[pathToName(path)];
    }
    getPersonaKey() {
        return this.getSessionData('personaKey');
    }

    getObject(typeName, key) {
        return this.dataTree[typeName]?.[key];
    }
    setObject(typeName, key, value) {
        const {prototypeKey, instanceKey, isLive} = this.props;
        const typeData = {...this.dataTree[typeName], [key]: value};
        this.dataTree = {...this.dataTree, [typeName]: typeData};
        this.notifyWatchers();

        if (isLive) {
            firebaseWriteAsync(['prototype', prototypeKey, 'instance', instanceKey, 'collection', typeName, key], value);
        }
    }
    addObject(typeName, value) {
        const {prototypeKey, instanceKey, isLive} = this.props;
        const key = isLive ? firebaseNewKey() : newLocalKey();
        const personaKey = this.getPersonaKey();
        this.addCurrentUser();
        const objectData = {key, from: personaKey, time: Date.now(), ...value};
        this.setObject(typeName, key, objectData);
        if (isLive) {
            firebaseWriteAsync(['prototype', prototypeKey, 'instance', instanceKey, 'collection', typeName, key], objectData);
        }
        return key;
    }
    modifyObject(typename, key, modFunc) {
        const object = this.getObject(typename, key);
        const newObject = modFunc(object);
        this.setObject(typename, key, newObject);
    }
    updateObject(typename, key, value) {
        const object = this.getObject(typename, key);
        const newObject = {...object, ...value};
        this.setObject(typename, key, newObject);
    }

    addCurrentUser() {
        if (this.props.isLive) {
            const personaKey = this.getPersonaKey();
            const fbUser = getFirebaseUser();
            const myPersona = this.getObject('persona', personaKey);
            if (!myPersona || myPersona.photoUrl != fbUser.photoURL || myPersona.name != fbUser.displayName) {
                this.setObject('persona', personaKey, {photoUrl: fbUser.photoURL, name: fbUser.displayName});
            }
        }    
    }

    getGlobalProperty(key) {
        return this.dataTree[key];
    }
    setGlobalProperty(key, value) {
        const {prototypeKey, instanceKey, isLive} = this.props;
        this.dataTree = {...this.dataTree, [key]: value};
        this.notifyWatchers();
        if (isLive) {
            firebaseWriteAsync(['prototype', prototypeKey, 'instance', instanceKey, 'global', key], value);
        }

    }
        
    render() {
        const {loaded} = this.state;
        if (loaded) {
        return <DatastoreContext.Provider value={this}>
            {this.props.children}
        </DatastoreContext.Provider>
        } else {
            return <LoadingScreen />
        }
    }
}


export function useDatastore() {
    return React.useContext(DatastoreContext);
}


export function useData() {
    const datastore = useDatastore();

    const [dataTree, setDataTree] = useState(datastore.dataTree);
    const [sessionData, setSessionData] = useState(datastore.sessionData);
    useEffect(() => {
        setDataTree(datastore.dataTree);
        setSessionData(datastore.sessionData);

        const watchFunc = () => {
            setDataTree(datastore.dataTree);
            setSessionData(datastore.sessionData);
        }
        datastore.watch(watchFunc);
        return () => {
            datastore.unwatch(watchFunc);
        }
    }, [datastore])
    return {dataTree, sessionData};
}

export function useSessionData(path) {
    const {sessionData} = useData();
    return sessionData[pathToName(path)];
}

export function usePersonaKey() {
    return useSessionData('personaKey');
}

export function useObject(typeName, key) {
    const {dataTree} = useData();
    return dataTree[typeName]?.[key];
}

export function useCollection(typeName, props = {}) {
    const {sortBy, filter} = props;
    const {dataTree} = useData();
    const collection = dataTree[typeName];

    if (!collection) {
        return [];
    }
    var result = sortMapValuesByProp(collection, sortBy || 'key');
    if (props.reverse) {
        result = result.reverse();
    }if (filter) {
        result = result.filter(item => meetsFilter(item, filter))
    }
    return result;
}

export function useGlobalProperty(key) {
    const {dataTree} = useData();
    return dataTree?.[key];
}

function meetsFilter(item, filter) {
    for (const [key, value] of Object.entries(filter)) {
        if (item[key] != value) return false;
    }
    return true;
}

function sortMapValuesByProp(obj, prop) {
    return sortArrayByProp(Object.values(obj), prop);
}

function sortArrayByProp(array, prop) {
    return array.sort((a, b) => {
        const valueA = a[prop];
        const valueB = b[prop];
    
        if (valueA < valueB) {
            return -1;
        }
        if (valueA > valueB) {
            return 1;
        }
        return 0;
    });
}



var global_nextKey = 0;
export function newLocalKey() {
    global_nextKey++;
    return global_nextKey;
}

export function ensureNextLocalKeyGreater(key) {
    if (typeof(key) == 'number') {
        if (global_nextKey <= key) {
            global_nextKey = key + 1;
        }
    }
}


function getInitialPersonaKey(instance) {
    if (instance.isLive) {
        return getFirebaseUser()?.uid || null;
    } else {
        return instance['$personaKey'] || firstPersona(instance) || defaultPersona;
    }
}

function firstPersona(instance) {
    if (!instance?.persona) {
        return null
    } else {
        const keys = Object.keys(instance.persona);
        return keys[0];
    }
}

function pathToName(path) {
    if (typeof(path) == 'string') {
        return path;
    } else {
        return path.join('/');
    }
}

