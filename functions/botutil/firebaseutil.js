
const admin = require('firebase-admin');

function expandPath(path) {
    if (typeof path == 'string') {
        return path;
    } else {
        return path.join('/');
    }
} 


async function firebaseWriteAsync(path, data) {
    const ref  = admin.database().ref(expandPath(path));
    return await ref.set(data);
}

async function firebaseReadAsync(path) {
    const ref  = admin.database().ref(expandPath(path));
    const snapshot = await ref.once('value');
    return snapshot.val();
}

async function firebaseUpdateAsync(path, data) {
    const ref = admin.database().ref(expandPath(path));
    return await ref.update(data);
}


function stringToFbKey(input) {
    const mapping = {
      '.': '%d',
      '#': '%h',
      '$': '%s',
      '/': '%f',
      '[': '%l',
      ']': '%r',
      '%': '%%'
    };
  
    return input.replace(/[.$#/[\]%]/g, match => mapping[match]);
  }
  
function fbKeyToString(input) {
    const reverseMapping = {
        '%d': '.',
        '%h': '#',
        '%s': '$',
        '%f': '/',
        '%l': '[',
        '%r': ']',
        '%%': '%'
    };

    return input.replace(/%d|%h|%s|%f|%l|%r|%%/g, match => reverseMapping[match]);
}



module.exports = {firebaseWriteAsync, firebaseReadAsync, firebaseUpdateAsync, stringToFbKey, fbKeyToString};


  