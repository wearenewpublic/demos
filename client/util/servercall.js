import { getIsLocalhost } from "../platform-specific/url";
import { appApiDomain, localHostApiDomain } from "./config";


// TODO: Do user-based authentication, once we have a database
export async function callServerApiAsync(component, funcname, params) {
    console.log('callServerApi', component, funcname, params);
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

export async function callServerMultipartApiAsync(component, funcname, params, fileParams={}) {
    console.log('callMultipartServerApi', component, funcname, params);
    try {
        let formData = new FormData();
        Object.keys(params).forEach(key => {
            formData.append(key, params[key]);
        })
        Object.keys(fileParams).forEach(key => {
            const {blob, filename} = fileParams[key];
            formData.append(key, blob, filename);
        });

        const apiUrl = makeApiUrl(component, funcname);
        console.log('apiUrl', apiUrl);
        console.log('formData', formData);
        const response = await fetch(apiUrl, {
            method: 'POST',
            // headers: {'Content-Type': 'application/json'},
            body: formData
        })
        const result = await response.json();
        if (result.success) {
            return result.data;
        } else {
            console.error('Error in server call', component, funcname, params, result.error);
            return null;
        }
    } catch (error) {
        console.error('Error in fetch', component, funcname, params, error);
    }
}



function makeApiUrl(component, funcname) {
    const apiDomain = getIsLocalhost() ? localHostApiDomain : appApiDomain;
    return `${apiDomain}/api/${component}/${funcname}`;
}



