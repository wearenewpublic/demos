
export function historyPushState({state, url}) {
    history.pushState(state, '', url);
}
 
export function watchPopState(callback) {
    window.addEventListener('popstate', event => callback(event.state));
}

export function getIsLocalhost() {
    return location.hostname == 'localhost';
}

export function setTitle(title) {
    window.document.title = title;
}
