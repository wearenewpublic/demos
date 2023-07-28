
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

export function WebLink({url, children}) {
    return <a href={url} style={{textDecoration: 'none'}} target='_blank'>{children}</a>;
}
