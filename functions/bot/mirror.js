const { getTimeAgo, mapKeys, encodeFixedPointArrayToBytes, decodeBytesToFixedPointArray } = require("../botutil/botutil");
const { firebaseWriteAsync, stringToFbKey, fbKeyToString, firebaseReadAsync, firebaseUpdateAsync } = require("../botutil/firebaseutil");
const { getEmbeddingsAsync } = require("../component/chatgpt");
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
    console.log('channel', channel);
    const result = await getSlackAsync({action: 'conversations.info', data: {channel}});
    console.log('result', result);
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
    const timeAgo = getTimeAgo({interval: 'month'});
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
    console.log('messages', messages);

    const encryptedMessages = encryptMap(messages);
    console.log('encrypted', encryptedMessages);

    await firebaseWriteAsync(['vault', 'slack', team, 'channel', channel, 'message'], encryptedMessages);

    const encryptedInfo = encrypt({text: JSON.stringify({name}), key: SLACK_ENCRYPTION_KEY}).data;
    await firebaseWriteAsync(['vault', 'slack', team, 'channelInfo', channel], encryptedInfo);

    return 'mirror completed'
};

exports.MirrorChannelCommand = MirrorChannelCommand


async function mirrorEmbeddingsAction({args, channel, team}) {
    const pMessages = firebaseReadAsync(['vault', 'slack', team, 'channel', channel, 'message']);
    const cEmbeddings = await firebaseReadAsync(['vault', 'slack', team, 'channel', channel, 'messageEmbedding']);
    const messages = decryptMap(await pMessages);
    const existingEmbeddings = cEmbeddings || {};
    var newEncryptedEmbeddings = {};
    console.log('embeddings', existingEmbeddings);

    for(var ts in messages) {
        const message = messages[ts];
        console.log('message', ts, message);
        if (!existingEmbeddings[stringToFbKey(ts)]) {
            const embedding = await getEmbeddingsAsync({text: message.text});
            console.log('embedding', embedding);
            const bytes = encodeFixedPointArrayToBytes(embedding.data);
            const encrypted = encryptBytes({data: bytes, key: SLACK_ENCRYPTION_KEY});
            newEncryptedEmbeddings[stringToFbKey(ts)] = encrypted;
            const decrypted = decryptBytes({encryptedData: encrypted, key: SLACK_ENCRYPTION_KEY});
            const decoded = decodeBytesToFixedPointArray(decrypted);
            console.log('decoded', decoded);
        } 
    }

    firebaseUpdateAsync(['vault', 'slack', team, 'channel', channel, 'messageEmbedding'], newEncryptedEmbeddings);


    return 'done';
}

exports.MirrorEmbeddingsCommand = MirrorEmbeddingsCommand
