import { ensureNextKeyGreater, newKey } from "../util/localdata";

export function expandDataList(list) {
    const date = new Date();
    date.setHours(date.getHours() - 1);

    var collection = {};

    list.forEach(item => {
        date.setMinutes(date.getMinutes() + 1);

        const key = item.key || newKey();
        ensureNextKeyGreater(key);
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

export function getHuesForNamedList(list) {
    const hues = {};
    list.forEach((item, index) => {
        hues[item.name] = (index / list.length) * 360;
    });
    return hues;
}

export function stripSuffix(str, suffix) {
    if (str.endsWith(suffix)) {
        return str.substring(0, str.length - suffix.length);
    } else {
        return str;
    }
}

export function stripSingleLineBreaks(text) {
    let result = text.replace(/\n\n/g, '<DOUBLE_LINE_BREAK>');
    result = result.replace(/\n/g, ' ');
    result = result.replace(/<DOUBLE_LINE_BREAK>/g, '\n\n');
    return result;
}

export function collapseDoubleSpaces(text) {
    let result = text.replace(/  /g, ' ');
    return result;
}
