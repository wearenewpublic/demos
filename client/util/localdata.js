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

export function useCollection(typeName, {sortBy}) {
    const data = useData();
    const collection = data[typeName];
    if (!collection) {
        console.error('No such type:', typeName);
    }
    const sorted = sortMapValuesByProp(collection, sortBy);
    return sorted;
}

export function useObject(typeName, key) {
    const data = useData();
    return data[typeName][key];
}

export function useGlobalProperty(key) {
    const data = useData();
    return data[key];
}

export function addObject(typename, value) {
    const key = newKey();
    setObject(typename, key, {...value, key});
    notifyDataWatchers();
}

export function setObject(typeName, key, value) {
    const typeData = {...global_data[typeName], [key]: value};
    setGlobalProperty(typeName, typeData);
}

export function setGlobalProperty(key, value) {
    setGlobalData({...global_data, [key]: value});
}
 

export function setGlobalData(data) {
    global_data = data;
    notifyDataWatchers();
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
    const keys = Object.keys(obj);
    const sortedKeys = sortArrayByProp(keys, prop);
    return sortedKeys.map(key => obj[key]);
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

