import { useContext, useEffect, useState } from "react";
import { DemoContext } from "../shared/DemoContext";

var global_data = null;
var data_watchers = [];

// TODO: Make this more efficient. Currently it updates everything for every data update.

function useData() {
    const {demoKey, instance, instanceKey} = useContext(DemoContext);
    if (!global_data) {
        global_data = deepClone(instance);
    }
    const [data, setData] = useState(global_data);


    useEffect(() => {
        setData(global_data);        

        const watchFunc = (newData) => {
            setData(newData);
        }
        data_watchers.push(watchFunc);

        return () => {
            data_watchers = data_watchers.filter(w => w !== watchFunc);
        }
    }, [demoKey, instanceKey])

    return data;
}

export function resetData(instance) {
    setGlobalData(deepClone(instance));    
}

export function useCollection(typeName) {
    const data = useData();
    return data[typeName]
}

export function useObject(typeName, key) {
    const data = useData();
    return data[typeName][key];
}

export function useGlobalProperty(key) {
    const data = useData();
    return data[key];
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

