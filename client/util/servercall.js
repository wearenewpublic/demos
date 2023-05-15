import { getIsLocalhost } from "../platform-specific/url";
import { appApiDomain, localHostApiDomain } from "./config";



// TODO: Do user-based authentication, once we have a database
export async function callServerApiAsync(component, funcname, params) {
    try {
        const apiUrl = makeApiUrl(component, funcname);
        console.log('apiUrl', apiUrl);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(params)
        })
        const result = await response.json();
        if (result.success) {
            return result.data;
        } else {
            console.error('Error in server call', component, funcname, params, result.error);
            return null;
        }
    } catch (error) {
        console.error('Error in fetch', component, funcname, params, result.error);
    }
}

function makeApiUrl(component, funcname) {
    const apiDomain = getIsLocalhost() ? localHostApiDomain : appApiDomain;
    return `${apiDomain}/api/${component}/${funcname}`;
}



