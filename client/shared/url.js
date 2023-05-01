import { useEffect, useState } from "react";
import { historyPushState, watchPopState } from "../util/shim";

export function useLivePath() {
    const [url, setUrl] = useState(window.location.pathname);

    useEffect(() => {
        watchPopState(() => {
            setUrl(window.location.pathname);
        })
    }, []);

    return url;
}

export function setUrlPath(path) {
    historyPushState({state: {path}, url: `/${path}`});
    window.location.pathname = path;
    // setUrl(window.location.href);
}
