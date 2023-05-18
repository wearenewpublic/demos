import { useEffect, useState } from "react";
import { historyPushState, watchPopState } from "../platform-specific/url";

// TODO: Using a global variable is a hack.  We should use a context instead.
var global_path_watcher = null;

export function useLivePath() {
    const [path, setPath] = useState(window.location.pathname);

    useEffect(() => {
        watchPopState(path => {
            setPath(window.location.pathname);
        })
        global_path_watcher = path => {
            setPath(path);
        }    
    }, []);

    return path;
}

export function setUrlPath(path) {
    historyPushState({state: {path}, url: `/${path}`});
    if (global_path_watcher) {
        global_path_watcher('/' + path);
    }
}

export function goBack() {
    const path = window.location.pathname;
    const parts = path.split('/').filter(x => x);
    parts.pop();
    const newPath = parts.join('/');
    setUrlPath(newPath);
}
