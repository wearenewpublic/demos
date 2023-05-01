
export function historyPushState({state, url}) {
    history.pushState(state, '', url);
}
 
export function watchPopState(callback) {
    window.addEventListener('popstate', event => callback(event.state));
}

