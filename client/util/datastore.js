
import React, { useEffect, useMemo, useState } from 'react';
import { adminPersonaList, defaultPersona, defaultPersonaList, memberPersonaList, personaListToMap } from '../data/personas';
import { firebaseNewKey, firebaseWatchValue, firebaseWriteAsync, getFirebaseDataAsync, getFirebaseUser, onFbUserChanged } from './firebase';
import { deepClone } from './util';
import { Text } from 'react-native';
import { LoadingScreen } from '../component/basics';
import { SharedDataContext } from './shareddata';

const DatastoreContext = React.createContext({});

// TODO: Make this more efficient: Currently every data update updates everything.

export class Datastore extends React.Component {
    state = {loaded: false}

    // dataTree = {};
    sessionData = {};

    // dataWatchers = [];
    fbUserWatchReleaser = null;
    fbDataWatchReleaser = null;

    componentDidMount() {
        this.resetData();
        if (this.props.isLive) {
            this.fbWatchReleaser = onFbUserChanged(user => {
                this.setSessionData('personaKey', user?.uid);
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

    getDefaultPersonaList() {
        const {instance, prototype, isLive} = this.props;
        if (isLive) {
            return [];
        } else if (instance.personaList) {
            return instance.personaList;
        } else if (prototype.hasMembers) {
            return memberPersonaList;
        } else if (prototype.hasAdmin) {
            return adminPersonaList;
        } else {
            return defaultPersonaList;
        }
    }

    resetData() {
        const {instance, instanceKey, prototype, prototypeKey, isLive} = this.props;

        const personaKey = getInitialPersonaKey(instance);
        this.sessionData = {personaKey}
        if (isLive) {
            this.fbDataWatchReleaser && this.fbDataWatchReleaser();
            this.fbDataWatchReleaser = firebaseWatchValue(['prototype', prototypeKey, 'instance', instanceKey], data => {
                this.setData({...this.getData(), ...data?.collection, ...data?.global});
                this.setState({loaded: true})
            });
        } else {
            this.setData({
                persona: personaListToMap(this.getDefaultPersonaList()),
                admin: instance.admin || 'a',
                ...deepClone(instance)
            })    
        }
    }

    // Delegate local data storage and notification to SharedDataContext
    // This allows the side-by-side view to work for role play instances.
    static contextType = SharedDataContext;
    watch(watchFunc) {this.context.watch(watchFunc)}
    unwatch(watchFunc) {this.context.unwatch(watchFunc)}
    notifyWatchers() {this.context.notifyWatchers()}
    getData() {return this.context.getData()}
    setData(data) {return this.context.setData(data)}

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
        return this.getData()[typeName]?.[key];
    }
    setObject(typeName, key, value) {
        const {prototypeKey, instanceKey, isLive} = this.props;
        if (!key || !typeName) {
            throw new Error('Missing key or typeName', key, typeName);
        }
        const typeData = {...this.getData()[typeName], [key]: value};
        this.setData({...this.getData(), [typeName]: typeData});
        // this.notifyWatchers();

        if (isLive) {
            firebaseWriteAsync(['prototype', prototypeKey, 'instance', instanceKey, 'collection', typeName, key], value);
            addInstanceToMyInstancesAsync({prototypeKey, instanceKey, dataTree: this.getData()});
        }
    }
    addObject(typeName, value) {
        const {isLive} = this.props;
        const key = isLive ? firebaseNewKey() : newLocalKey();
        const personaKey = this.getPersonaKey();
        this.addCurrentUser();
        const objectData = {key, from: personaKey, time: Date.now(), ...value};
        this.setObject(typeName, key, objectData);
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
    addObjectWithKey(typeName, key, value) {
        const personaKey = this.getPersonaKey();
        this.addCurrentUser();
        const objectData = {key, from: personaKey, time: Date.now(), ...value};
        this.setObject(typeName, key, objectData);
        return key;
    }

    addCurrentUser() {
        if (this.props.isLive) {
            const personaKey = this.getPersonaKey();
            const fbUser = getFirebaseUser();
            const myPersona = this.getObject('persona', personaKey);
            if (!myPersona || myPersona.photoUrl != fbUser.photoURL || myPersona.name != fbUser.displayName) {
                this.setObject('persona', personaKey, {
                    photoUrl: fbUser.photoURL, 
                    name: fbUser.displayName, 
                    key: personaKey,
                    member: myPersona?.member || null
                });
            }
        }    
    }

    getGlobalProperty(key) {
        return this.getData()[key];
    }
    setGlobalProperty(key, value) {
        const {prototypeKey, instanceKey, isLive} = this.props;
        this.setData({...this.getData(), [key]: value});
        // this.notifyWatchers();
        if (isLive) {
            firebaseWriteAsync(['prototype', prototypeKey, 'instance', instanceKey, 'global', key], value);
        }
    }

    getPrototypeKey() {return this.props.prototypeKey}
    getInstanceKey() {return this.props.instanceKey}
    getLanguage() {return this.getGlobalProperty('language') || 'English'}
        
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

export async function addCurrentUserToInstanceAsync({prototypeKey, instanceKey, isMember}) {
    const fbUser = getFirebaseUser();
    await firebaseWriteAsync(['prototype', prototypeKey, 'instance', instanceKey, 'collection', 'persona', fbUser.uid], {
        photoUrl: fbUser.photoURL, 
        name: fbUser.displayName, 
        key: personaKey,
        member: isMember
    });
}

export async function addInstanceToMyInstancesAsync({prototypeKey, instanceKey, dataTree}) {
    console.log('addInstanceToMyInstancesAsync', prototypeKey, instanceKey, dataTree);
    const firebaseUser = getFirebaseUser();
    console.log('firebaseUser', firebaseUser);
    await firebaseWriteAsync(['userInstance', firebaseUser.uid, prototypeKey, instanceKey], {
        name: dataTree.name, 
        language: dataTree.language || null,
        createTime: dataTree.createTime || Date.now(),
        updateTime: Date.now()
    });
    console.log('wrote');
}


export function useDatastore() {
    return React.useContext(DatastoreContext);
}


export function useData() {
    const datastore = useDatastore();

    const [dataTree, setDataTree] = useState(datastore.getData());
    const [sessionData, setSessionData] = useState(datastore.sessionData);
    useEffect(() => {
        setDataTree(datastore.getData());
        setSessionData(datastore.sessionData);

        const watchFunc = () => {
            setDataTree(datastore.getData());
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

export function usePersona() {
    const personaKey = usePersonaKey();
    return useObject('persona', personaKey);
}

export function useObject(typeName, key) {
    const {dataTree} = useData();
    return dataTree[typeName]?.[key];
}

// We have to be careful with memoization here, or we end up creating a new
// result object every time, which messes up dependencies elsehere
export function useCollection(typeName, props = {}) {
    const {dataTree} = useData();
    const collection = dataTree[typeName];
    const result = useMemo(() => processObjectList(collection, props),
        [collection, JSON.stringify(props)]
    )
    return result;
}

function processObjectList(collection, {sortBy, reverse, limit, filter}) {
    var result = sortMapValuesByProp(collection ?? [], sortBy || 'key');
    if (reverse) {
        result = result.reverse();
    } if (filter) {
        result = result.filter(item => meetsFilter(item, filter))
    } if (limit) {
        result = result.slice(0, limit);
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

function makeFirebasePath(path) {
    return path.map(encodeURIComponent).join('%2F');
}

export function makeStorageUrl({datastore, userId, fileKey, extension}) {
    const prototypeKey = datastore.getPrototypeKey();
    const instanceKey = datastore.getInstanceKey();
    const storagePrefix = 'https://firebasestorage.googleapis.com/v0/b/new-public-demo.appspot.com/o/';
    const path = ['user', userId, prototypeKey, instanceKey, fileKey + '.' + extension];
    const pathString = makeFirebasePath(path);
    return storagePrefix + pathString + '?alt=media';
}
