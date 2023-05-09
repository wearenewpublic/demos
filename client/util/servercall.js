import { getIsLocalhost } from "../platform-specific/url";
import { localHostApiDomain } from "./config";



// TODO: Do user-based authentication, once we have a database
export async function callServerApiAsync(component, funcname, params) {
    const apiUrl = makeApiUrl(component, funcname);
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(params)
    })
    const result = await response.json();
    if (result.success) {
        return result.data;
    } else {
        throw new Error(result.error);
    }
}

function makeApiUrl(component, funcname) {
    const apiDomain = getIsLocalhost() ? localHostApiDomain : appDomain;
    return `${apiDomain}/api/${component}/${funcname}`;
}



