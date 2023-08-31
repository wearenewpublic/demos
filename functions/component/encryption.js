const crypto = require('crypto');

const algorithm = 'aes-256-cbc';

// module.exports = {

  // Generates a random encryption key
function generateKey() {
    return {data: crypto.randomBytes(32).toString('hex')};  // 256 bits key for aes-256-cbc
}
exports.generateKey = generateKey;

  // Encrypts text using the given key
function encrypt({text, key}) {
    const iv = crypto.randomBytes(16);  // initialization vector
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {data: iv.toString('hex') + encrypted};  // return iv + encrypted data
}
exports.encrypt = encrypt;

  // Decrypts text using the given key
function decrypt({encryptedText, key}) {
    const iv = Buffer.from(encryptedText.slice(0, 32), 'hex');  // extract the iv from the front
    const encrypted = encryptedText.slice(32);
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return {data: decrypted};
}
exports.decrypt = decrypt;

exports.apiFunctions = {
    generateKey, encrypt, decrypt
}
