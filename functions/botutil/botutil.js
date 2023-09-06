

function getTimeAgo({interval = 'week'}) {
    switch (interval) {
        case 'week':
            return Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
        case 'day':
            return Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
        case 'hour':
            return Math.floor((Date.now() - 60 * 60 * 1000) / 1000);
        case 'month':
            return Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
        case 'year':
            return Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000);
        default: 
            return 0;
    }
}

exports.getTimeAgo = getTimeAgo


function omitNullAndUndefined(obj) {
    const result = {};
    for (const key in obj) {
      if (obj[key] !== null && obj[key] !== undefined) {
        result[key] = obj[key];
      }
    }
    return result;
}

exports.omitNullAndUndefined = omitNullAndUndefined;


function encodeFixedPointArrayToBytes(floatArray) {
    const byteArr = [];

    for (let num of floatArray) {
        // Scale from [-1, 1] to [0, 65535]
        const scaled = (num + 1) * 0.5 * 65535;
        const uint16 = Math.round(scaled);

        // Push high byte and low byte to the array
        byteArr.push((uint16 & 0xFF00) >> 8);  // High byte
        byteArr.push(uint16 & 0x00FF);        // Low byte
    }

    return Buffer.from(byteArr);
}
exports.encodeFixedPointArrayToBytes = encodeFixedPointArrayToBytes;

function decodeBytesToFixedPointArray(buffer) {
    const byteArr = Array.from(buffer)
    if (byteArr.length % 2 !== 0) {
        throw new Error("Byte array length must be even");
    }

    const floatArray = [];

    for (let i = 0; i < byteArr.length; i += 2) {
        // Combine high byte and low byte to form the unsigned integer
        const uint16 = (byteArr[i] << 8) | byteArr[i + 1];

        // Scale from [0, 65535] to [-1, 1]
        const scaled = (uint16 / 65535) * 2 - 1;

        floatArray.push(scaled);
    }

    return floatArray;
}
exports.decodeBytesToFixedPointArray = decodeBytesToFixedPointArray;



// // Example usage:
// const floatArray = [0.12345, -0.6789, 0.98765];
// const encodedBytes = encodeFixedPointArrayToBytes(floatArray);
// console.log(`Encoded bytes: ${encodedBytes}`);

// const decodedFloats = decodeBytesToFixedPointArray(encodedBytes);
// console.log(`Decoded floats: ${decodedFloats}`);

function mapKeys(object, callback) {
    return Object.keys(object || {}).map(key => callback(key, object[key]))    
}
exports.mapKeys = mapKeys;
