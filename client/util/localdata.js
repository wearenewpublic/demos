import { useContext, useEffect, useState } from "react";
import { defaultPersona, personas } from "../demo";
import { DemoContext } from "../shared/DemoContext";

var global_data = null;
var data_watchers = [];

// TODO: Make this more efficient. Currently it updates everything for every data update.

function useData() {
    const {demoKey, instance, instanceKey} = useContext(DemoContext);
    if (!global_data) resetData(instance);

    const [data, setData] = useState(global_data);

    useEffect(() => {
        setData(global_data);        

        const watchFunc = (newData) => setData(newData);
        data_watchers.push(watchFunc);

        return () => {
            data_watchers = data_watchers.filter(w => w !== watchFunc);
        }
    }, [demoKey, instanceKey])

    return data;
}

export function resetData(instance) {
    setGlobalData({persona: deepClone(personas), ['$personaKey']: defaultPersona, ...deepClone(instance)});    
}

export function useCollection(typeName, props = {}) {
    const {sortBy} = props;
    const data = useData();
    const collection = data[typeName];
    if (!collection) {
        console.error('No such type:', typeName);
    }
    const sorted = sortMapValuesByProp(collection, sortBy || 'key');
    if (props.reverse) return sorted.reverse()
    else return sorted;
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
    console.log('data, addObject', global_data);
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


function notifyDataWatchers() {
    data_watchers.forEach(w => w(global_data));
}



var global_nextKey = 0;
export function newKey() {
    global_nextKey++;
    return global_nextKey;
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

