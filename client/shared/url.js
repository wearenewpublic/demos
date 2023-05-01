import { useEffect, useState } from "react";
import { historyPushState, watchPopState } from "../util/shim";

// TODO: Using a global variable is a hack.  We should use a context instead.
var global_path_watcher = null;

export function useLivePath() {
    const [path, setPath] = useState(window.location.pathname);

    useEffect(() => {
        watchPopState(() => {
            setPath(window.location.pathname);
        })
    }, []);

    global_path_watcher = setPath;
    return path;
}

export function setUrlPath(path) {
    historyPushState({state: {path}, url: `/${path}`});
    if (global_path_watcher) {
        global_path_watcher('/' + path);
    }
}
