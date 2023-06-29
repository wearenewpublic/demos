
import React, { useEffect, useState } from 'react';
import { defaultPersona, personas } from '../data/personas';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseUser, onFbUserChanged } from './firebase';

const DatastoreContext = React.createContext({});

// TODO: Make this more efficient: Currently every data update updates everything.

export class Datastore extends React.Component {
    dataTree = {};
    sessionData = {};

    dataWatchers = [];
    fbWatchReleaser = null;

    componentDidMount() {
        this.resetData();
        if (this.props.isLive) {
            this.fbWatchReleaser = onFbUserChanged(user => {
                this.setSessionData('personaKey', user.uid);
            })
        }
    }
    componentWillUnmount() {
        this.fbWatchReleaser && this.fbWatchReleaser();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.instanceKey != this.props.instanceKey || prevProps.prototypeKey != this.props.prototypeKey) {
            this.resetData();
        }
    }

    resetData() {
        const {instance} = this.props;

        const personaKey = getInitialPersonaKey(instance);
        this.dataTree = {
            persona: deepClone(instance.personas || personas),
            ...deepClone(instance)
        }
        this.sessionData = {personaKey}
        console.log('resetData', deepClone({dataTree: this.dataTree, sessionData: this.sessionData}));
        this.notifyWatchers();
    }

    watch(watchFunc) {
        this.dataWatchers.push(watchFunc);
    }
    unwatch(watchFunc) {
        this.dataWatchers = this.dataWatchers.filter(w => w !== watchFunc);
    }
    notifyWatchers() {
        // console.log('notifyWatchers', this.dataWatchers);
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
        const typeData = {...this.dataTree[typeName], [key]: value};
        this.setGlobalProperty(typeName, typeData);
    }
    addObject(typeName, value) {
        const key = newKey();
        const personaKey = this.getPersonaKey();
        this.addCurrentUser();
        this.setObject(typeName, key, {key, from: personaKey, time: Date.now(), ...value});
        return key;
    }
    modifyObject(typename, key, modFunc) {
        const object = this.getObject(typename, key);
        const newObject = modFunc(object);
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
        this.dataTree = {...this.dataTree, [key]: value};
        this.notifyWatchers();
    }
        
    render() {
        return <DatastoreContext.Provider value={this}>
            {this.props.children}
        </DatastoreContext.Provider>
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
    return dataTree[key];
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
export function newKey() {
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

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
