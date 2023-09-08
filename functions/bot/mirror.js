const { getTimeAgo, mapKeys, encodeFixedPointArrayToBytes, decodeBytesToFixedPointArray } = require("../botutil/botutil");
const { firebaseWriteAsync, stringToFbKey, fbKeyToString, firebaseReadAsync, firebaseUpdateAsync } = require("../botutil/firebaseutil");
const { getEmbeddingsAsync, getEmbeddingsArrayAsync } = require("../component/chatgpt");
const { encrypt, decrypt, encryptBytes, decryptBytes } = require("../component/encryption");
const { callSlackAsync, getSlackAsync } = require("../component/slack");
const { SLACK_ENCRYPTION_KEY } = require("../keys");

const MirrorUsersCommand = {
    description: 'Update our remote mirror of users in this slack server',
    action: mirrorUsersAction,
    slow: true
}


const MirrorChannelCommand = {
    description: 'Update our remote mirror of this channel',
    action: mirrorChannelAction,
    slow: true
}

const MirrorEmbeddingsCommand = {
    description: 'Generate embeddings for messages in this channel',
    action: mirrorEmbeddingsAction,
    slow: true
}


async function getUsers() {    
    const users = await callSlackAsync({action: 'users.list'});
    if (!users.members || users.members.length == 0) {
        console.log('request failed', users);
        throw new Error('Error getting user list');
    }
    var userMap = {}
    users.members.forEach(user => {
        userMap[user.id] = user;
    })
    return userMap;    
}

function getUserNameMap(users) {
    var userNameMap = {};
    Object.keys(users).forEach(id => {
        userNameMap[id] = users[id].profile?.display_name || users[id].real_name || users[id].name;
    })
    return userNameMap;
}

function getUserMini(users) {
    var userMini = {};
    Object.keys(users).forEach(id => {
        const user = users[id];
        const profile = user.profile;
        userMini[id] = {
            name: profile?.display_name || profile?.real_name || user?.real_name || user?.name, 
            deleted: user.deleted,
            image: profile?.image_72
        };
    })
    return userMini;
}

function encryptMap(map) {
    var encryptedMap = {};
    Object.keys(map).forEach(id => {
        const plainText = JSON.stringify(map[id]);
        const cipherText  = encrypt({text: plainText, key: SLACK_ENCRYPTION_KEY}).data;
        encryptedMap[stringToFbKey(id)] = cipherText;
    })
    return encryptedMap;
}

function decryptMap(map) {
    var decryptedMap = {};
    Object.keys(map).forEach(id => {
        const cipherText = map[id];
        const plainText = decrypt({encryptedText: cipherText, key: SLACK_ENCRYPTION_KEY}).data;
        decryptedMap[fbKeyToString(id)] = JSON.parse(plainText);
    })
    return decryptedMap;
}


async function mirrorUsersAction({args, channel, team}) {
    const users = await getUsers();
    const usersMini = getUserMini(users);
    const encryptedUsersMini = await encryptMap(usersMini);
    await firebaseWriteAsync(['vault', 'slack', team, 'users'], encryptedUsersMini);

    return 'mirror completed'
};

exports.MirrorUsersCommand = MirrorUsersCommand;


async function getChannelNameAsync({channel}) {
    // console.log('channel', channel);
    const result = await getSlackAsync({action: 'conversations.info', data: {channel}});
    // console.log('result', result);
    if (result.ok == true) {
        return result.channel.name;
    }
}

async function ODD_getChannelNameAsync({channel}) {
    const result = await callSlackAsync({action: 'conversations.info', data: {channel}});
    console.log('result', result);
    if (result.ok == true) {
        return result.channel.name;
    }
}


async function getChannelMessages({channel}) {
    const timeAgo = getTimeAgo({interval: 'year'});
    const messagesResult = await callSlackAsync({action: 'conversations.history', data: {channel, limit: 1000, oldest: timeAgo.toString()}});
    var tsMap = {};
    messagesResult.messages.forEach(message => {
        tsMap[message.ts] = message;
    })
    return tsMap;
}


async function mirrorChannelAction({args, channel, team}) {
    const name = await getChannelNameAsync({channel});
    const messages = await getChannelMessages({channel});

    const encryptedMessages = encryptMap(messages);

    await firebaseUpdateAsync(['vault', 'slack', team, 'channel', channel, 'message'], encryptedMessages);

    const encryptedInfo = encrypt({text: JSON.stringify({name}), key: SLACK_ENCRYPTION_KEY}).data;
    await firebaseWriteAsync(['vault', 'slack', team, 'channelInfo', channel], encryptedInfo);

    return 'mirror completed'
};

exports.MirrorChannelCommand = MirrorChannelCommand


function getMessageEmbeddingChunks({messages, existingEmbeddings, chunkSize}) {
    var chunks = [];
    var thisChunk = [];
    var count = 0;
    var charCount = 0;

    for(var ts in messages) {
        const message = messages[ts];
        if (!existingEmbeddings[stringToFbKey(ts)] && count < 1000) {
            if (count < 1000 && charCount < 8000) {
                thisChunk.push(ts);
                charCount += message.text.length + 1;
                count++;
            } else {
                chunks.push(thisChunk);
                thisChunk = [];
                count = 0;
                charCount = 0;    
            }
        }
    }
    chunks.push(thisChunk);
    return chunks;
}

// TODO: Batch in limited size chunks for OpenAI requests
async function mirrorEmbeddingsAction({args, channel, team}) {
    const pMessages = firebaseReadAsync(['vault', 'slack', team, 'channel', channel, 'message']);
    const cEmbeddings = await firebaseReadAsync(['vault', 'slack', team, 'channel', channel, 'messageEmbedding']);
    const messages = decryptMap(await pMessages);
    var existingEmbeddings = cEmbeddings || {};

    const chunks = getMessageEmbeddingChunks({messages, existingEmbeddings, chunkSize: 1000});
    console.log('chunks', chunks);

    for (i in chunks) {
        console.log('chunk', i);
        const thisChunk = chunks[i];
        const textArray = thisChunk.map(ts => messages[ts].text);
        const embeddings = await getEmbeddingsArrayAsync({textArray});
        for(var i = 0; i < thisChunk.length; i++) {
            const ts = thisChunk[i];
            const embedding = embeddings[i];
            const bytes = encodeFixedPointArrayToBytes(embedding);
            const encrypted = encryptBytes({data: bytes, key: SLACK_ENCRYPTION_KEY});
            existingEmbeddings[stringToFbKey(ts)] = encrypted;
        }
        firebaseUpdateAsync(['vault', 'slack', team, 'channel', channel, 'messageEmbedding'], existingEmbeddings);
    }

    return 'did chunks: ' + chunks.length;
}


// TODO: Batch in limited size chunks for OpenAI requests
async function mirrorEmbeddingsActionOLD({args, channel, team}) {
    const pMessages = firebaseReadAsync(['vault', 'slack', team, 'channel', channel, 'message']);
    const cEmbeddings = await firebaseReadAsync(['vault', 'slack', team, 'channel', channel, 'messageEmbedding']);
    const messages = decryptMap(await pMessages);
    var existingEmbeddings = cEmbeddings || {};

    var needEmbeddingsText = [];
    var needEmbeddingsIds = [];
    var count = 0;
    var charCount = 0;
    var skipped = 0;
    var leftover = 0;

    const chunks = getMessageEmbeddingChunks({messages, existingEmbeddings, chunkSize: 1000});
    console.log('chunks', chunks);
    return 'did chunks: ' + chunks.length;

    for(var ts in messages) {
        const message = messages[ts];
        if (!existingEmbeddings[stringToFbKey(ts)] && count < 1000) {
            if (count < 1000 && charCount < 8000) {
                needEmbeddingsIds.push(ts);
                needEmbeddingsText.push(message.text);
                charCount += message.text.length + 1;
                count++;
            } else {
                leftover++;
            }
        } else {
            skipped++;
        }
    }

    if (needEmbeddingsIds.length == 0) {
        return 'computed: ' + count + ' skipped: ' + skipped + ' leftover: ' + leftover;
    } 

    const emeddings = await getEmbeddingsArrayAsync({textArray: needEmbeddingsText});

    var newEncryptedEmbeddings = {};
    for(var i = 0; i < needEmbeddingsIds.length; i++) {
        const ts = needEmbeddingsIds[i];
        const embedding = emeddings[i];
        const bytes = encodeFixedPointArrayToBytes(embedding);
        const encrypted = encryptBytes({data: bytes, key: SLACK_ENCRYPTION_KEY});
        newEncryptedEmbeddings[stringToFbKey(ts)] = encrypted;
    }

    firebaseUpdateAsync(['vault', 'slack', team, 'channel', channel, 'messageEmbedding'], newEncryptedEmbeddings);
    
}



exports.MirrorEmbeddingsCommand = MirrorEmbeddingsCommand
