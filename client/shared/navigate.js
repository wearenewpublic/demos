import { gotoUrl } from "./url";
import { stripSuffix } from "./util";


export function goBack() {
    const parts = window.location.pathname.split('/').filter(x => x);
    const query = new URLSearchParams(window.location.search);

    parts.pop();
    removeParamsWithSuffix(query, getParamSuffixForIndex(parts.length - 2));

    gotoUrl(makeUrl(parts, query));
}

export function pushSubscreen(key, params) {
    const parts = window.location.pathname.split('/').filter(x => x);
    const query = new URLSearchParams(window.location.search);
    parts.push(key);
    const index = parts.length - 3;

    for (const [key, value] of Object.entries(params)) {
        query.set(key + getParamSuffixForIndex(index), value);
    }

    gotoUrl(makeUrl(parts, query));
}

export function gotoDemo(demoKey) {
    gotoUrl(makeUrl([demoKey]));
}

export function gotoInstance(demoKey, instanceKey) {
    gotoUrl(makeUrl([demoKey, instanceKey]));
}


function removeParamsWithSuffix(urlParams, suffix) {
    for(let [key, value] of urlParams) {
        if(key.endsWith(suffix)) {
            urlParams.delete(key);
        }
    }
}

function getParamsWithSuffix(urlParams, suffix) {
    const result = {};
    for(let [key, value] of urlParams) {
        if (suffix) {
            if(key.endsWith(suffix)) {
                result[stripSuffix(key, suffix)] = value;
            }
        } else {
            if(!key.includes('_')) {
                result[key] = value;
            }
        }
    }
    return result;
}


function makeUrl(parts, query = new URLSearchParams()) {
    const url = new URL(window.location.href);
    url.pathname = parts.join('/');
    url.search = query.toString();
    return url.toString();
}

function getParamSuffixForIndex(index) {
    return index ? ('_' + index) : '';
}

export function getScreenStackForUrl(url) {
    const parsedUrl = new URL(url);
    const parts = parsedUrl.pathname.split('/').filter(x => x);
    const query = new URLSearchParams(parsedUrl.search);
    var [demoKey, instanceKey, ...screenParts] = parts;

    if (!demoKey) return {}
    if (!instanceKey) return {demoKey};

    var screenStack = [{demoKey, instanceKey, screenKey: null, params: {}}];

    for (var i = 0; i < screenParts.length; i++) {
        const screenKey = screenParts[i];
        const params = getParamsWithSuffix(query, getParamSuffixForIndex(i));
        screenStack.push({demoKey, instanceKey, screenKey, params});
    }
    return {demoKey, instanceKey, screenStack};
}
