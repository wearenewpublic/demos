
export function historyPushState({state, url}) {
    console.log('historyPushState', )
    history.pushState(state, '', url);
}
 
export function watchPopState(callback) {
    window.addEventListener('popstate', event => callback(event.state));
}

