import { newKey } from "../util/localdata";

export function expandDataList(list) {
    const date = new Date();
    date.setHours(date.getHours() - 1);

    var collection = {};

    list.forEach(item => {
        date.setMinutes(date.getMinutes + 1);
        const key = item.key || newKey();
        collection[key] = {
            ...item,
            key,
            time: date.getTime()
        };
    });
    
    return collection;
}

export function removeKey(collection, key) {
    const newCollection = {...collection};
    delete newCollection[key];
    return newCollection;
}

export function addKey(collection, key, value=true) {
    return {...collection, [key]: value};
}