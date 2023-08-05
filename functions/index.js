const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://new-public-demo-default-rtdb.firebaseio.com',
    storageBucket: 'gs://new-public-demo.appspot.com',
});

const Busboy = require('busboy');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { components } = require("./component");
const cors = require('cors')({origin: true})


exports.api = functions.https.onRequest((req, res) => {
    const contentType = req.headers['content-type'] || '';

    console.log('api request', req.method, req.path, contentType);
    if (req.method == 'OPTIONS') {
        cors(req, res, () => {
            response.status(200);
        });
        return;
    } else if (req.method === 'POST') {  
        if (contentType.includes('multipart/form-data')) {
            handleMultipartRequest(req, res);
        } else if (contentType.includes('application/json')) {
            handleJsonRequest(req, res);
        } else {
            res.status(415).send({error: 'Unsupported Content-Type'});
        }
    } else {
        res.status(415).send({error: 'Unsupported HTTP Method'});
    }
})
 
function handleMultipartRequest(req, res) {
    const busboy = Busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();

    let fileWrites = [];
    let fields = {};

    busboy.on('field', (fieldname, val) => {
        fields[fieldname] = val;
    });

    busboy.on('file', (fieldname, file, fileInfo) => {
        const filepath = path.join(tmpdir, fileInfo.filename);
        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);

        const promise = new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        fields[fieldname] = filepath;
        fileWrites.push(promise);
    });

    busboy.on('finish', async () => {
        await Promise.all(fileWrites);

        const {statusCode, result} = await callApiFunctionAsync(req, fields);

        cors(req, res, () => {
            res.status(statusCode);
            res.send(result);
        });
    });

    busboy.end(req.rawBody);
};

async function handleJsonRequest(request, response) {
    const fields = {...request.query, ...request.body};
    const {statusCode, result} = await callApiFunctionAsync(request, fields);
    cors(request, response, () => {
        console.log('in cors', statusCode, result);
        response.status(statusCode);
        response.send(result);
    })
}
    

async function getValidatedUser(req) {
    const tokenId = req.headers.authorization && req.headers.authorization.split('Bearer ')[1];
    if (!tokenId || tokenId == 'none') {
        return null;
    } 
    try {
        const decodedToken = await admin.auth().verifyIdToken(tokenId);
        return decodedToken.uid;
    } catch (error) {
        console.error('Error verifying Firebase ID token:', error);
        return 'error';
    }
}


async function callApiFunctionAsync(request, fields) {
    console.log('callApiFunctionAsync', request.path, fields);
    const {componentId, apiId} = parsePath(request.path);

    const component = components[componentId];
    const apiFunction = component?.apiFunctions?.[apiId];
    const userId = await getValidatedUser(request);
    const params = {...request.query, ...fields, userId};

    console.log('user', userId);

    if (userId == 'error') {
        return ({statusCode: 500, result: JSON.stringify({success: false, error: 'Error validating user'})});
    } else if (!component || !apiFunction) {
        return ({statusCode: 400, result: JSON.stringify({success: false, error: 'Unknown api', path: request.path, componentId, apiId})});
    }

    const apiResult = await apiFunction(params); 

    if (apiResult.data) {
        return ({statusCode: 200, result: JSON.stringify({success: true, data: apiResult.data})});
    } else if (apiResult.error) {
        return ({statusCode: 400, result: JSON.stringify({success: false, error: apiResult.error})});
    } else {
        return ({statusCode: 500, result: JSON.stringify({success: false, error: 'Unknown error'})});
    }
}


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

