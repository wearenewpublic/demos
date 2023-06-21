import { useContext, useEffect, useState } from "react";
import { defaultPersona, personas } from "../data/personas";
import { PrototypeContext } from "../organizer/PrototypeContext";

var global_data = null;
var data_watchers = [];

// TODO: Make this more efficient. Currently it updates everything for every data update.

function useData() {
    const {prototypeKey, instance, instanceKey} = useContext(PrototypeContext);
    if (!global_data) resetData(instance);

    const [data, setData] = useState(global_data);

    useEffect(() => {
        const watchFunc = (newData) => setData(newData);
        data_watchers.push(watchFunc);

        return () => {
            data_watchers = data_watchers.filter(w => w !== watchFunc);
        }
    }, [prototypeKey, instanceKey])

    return data;
}

function firstPersona(instance) {
    if (!instance?.persona) {
        return null
    } else {
        const keys = Object.keys(instance.persona);
        return keys[0];
    }

}

export function resetData(instance) {
    const personaKey = firstPersona(instance) || defaultPersona;
    global_data = ({persona: deepClone(personas), ['$personaKey']: personaKey, ...deepClone(instance)});    
}

export function test_getDataWatchers() {return data_watchers};

export function useCollection(typeName, props = {}) {
    const {sortBy, filter} = props;
    const data = useData();
    const collection = data[typeName];
    if (!collection) {
        console.error('No such type:', typeName);
    }
    var result = sortMapValuesByProp(collection, sortBy || 'key');
    if (props.reverse) {
        result = result.reverse();
    }if (filter) {
        result = result.filter(item => meetsFilter(item, filter))
    }
    return result;
}

function meetsFilter(item, filter) {
    for (const [key, value] of Object.entries(filter)) {
        if (item[key] != value) return false;
    }
    return true;
}

export function useCollectionMap(typeName) {
    const data = useData();
    const collection = data[typeName];
    return collection;
}

export function useObject(typeName, key) {
    const data = useData();
    return data[typeName]?.[key];
}

export function useGlobalProperty(key) {
    const data = useData();
    return data[key];
}

export function addObject(typename, value) {
    const key = newKey();
    const from = getGlobalProperty('$personaKey');
    setObject(typename, key, {from, ...value, key, time: Date.now()});
    notifyDataWatchers();
    return key
}

export function modifyObject(typename, key, modFunc) {
    const object = global_data[typename][key];
    const newObject = modFunc(object);
    setObject(typename, key, newObject);
}

export function setObject(typeName, key, value) {
    const typeData = {...global_data[typeName], [key]: value};
    setGlobalProperty(typeName, typeData);
}

export function setGlobalProperty(key, value) {
    setGlobalData({...global_data, [key]: value});
}
 
function pathToName(path) {
    if (typeof(path) == 'string') {
        return path;
    } else {
        return path.join('/');
    }
}

export function useSessionData(path) {
    return useObject('$session', pathToName(path))
}

export function setSessionData(path, value) {
    return setObject('$session', pathToName(path), value);
}

export function getSessionData(path) {
    return global_data['$session']?.[pathToName(path)];
}

export function setGlobalData(data) {
    global_data = data;
    notifyDataWatchers();
}

export function getObject(typeName, key) {
    return global_data[typeName]?.[key];
}

export function getGlobalProperty(key) {
    return global_data[key];
}

export function getAllData() {
    return global_data;
}

export function usePersonaKey() {
    return useGlobalProperty('$personaKey');
}

export function getPersonaKey() {
    return getGlobalProperty('$personaKey');
}


function notifyDataWatchers() {
    data_watchers.forEach(w => w(global_data));
}



var global_nextKey = 0;
export function newKey() {
    global_nextKey++;
    return global_nextKey;
}

export function ensureNextKeyGreater(key) {
    if (typeof(key) == 'number') {
        if (global_nextKey <= key) {
            global_nextKey = key + 1;
        }
    }
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
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

