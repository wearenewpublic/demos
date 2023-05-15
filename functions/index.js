const functions = require("firebase-functions");
const { components } = require("./component");
const cors = require('cors')({origin: true})

exports.api = functions.https.onRequest(async (request, response) => {
    if (request.method == 'OPTIONS') {
        cors(request, response, () => {
            response.status(200);
        });
        return;
    }

    const {componentId, apiId} = parsePath(request.path);

    const component = components[componentId];
    const apiFunction = component?.apiFunctions?.[apiId];
    const params = {...request.query, ...request.body};

    if (!component || !apiFunction) {
        response.status(400);
        response.send(JSON.stringify({success: false, error: 'Unknown api', path: request.path, componentId, apiId}));
        return;
    }

    const result = await apiFunction(params); 
    cors(request, response, () => {
        if (result.data) {
            response.status(200);
            response.send(JSON.stringify({success: true, data: result.data}));
        } else if (result.error) {
            response.status(400);
            response.send(JSON.stringify({success: false, error: result.error}));
        } else {
            response.status(500);
            response.send(JSON.stringify({success: false, error: 'Unknown error'}));
        }  
    }); 
});

function parsePath(path) {
    var parts = path.split('/').filter(x => x);
    if (parts[0] == 'api') {
        parts = parts.slice(1);
    }

    return {
        componentId: parts[0],
        apiId: parts[1],
    }
}

