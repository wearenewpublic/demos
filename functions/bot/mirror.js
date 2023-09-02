const { getTimeAgo } = require("../botutil/botutil");
const { firebaseWriteAsync, stringToFbKey, fbKeyToString } = require("../botutil/firebaseutil");
const { encrypt, decrypt } = require("../component/encryption");
const { callSlackAsync } = require("../component/slack");
const { SLACK_ENCRYPION_KEY } = require("../keys");

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
        const cipherText  = encrypt({text: plainText, key: SLACK_ENCRYPION_KEY}).data;
        encryptedMap[stringToFbKey(id)] = cipherText;
    })
    return encryptedMap;
}

function decryptMap(map) {
    var decryptedMap = {};
    Object.keys(map).forEach(id => {
        const cipherText = map[id];
        const plainText = decrypt({encryptedText: cipherText, key: SLACK_ENCRYPION_KEY}).data;
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
    const messages = await getChannelMessages({channel});
    console.log('messages', messages);

    const encryptedMessages = encryptMap(messages);
    console.log('encrypted', encryptedMessages);

    await firebaseWriteAsync(['vault', 'slack', team, 'channel', channel, 'message'], encryptedMessages);

    return 'mirror completed'
};

exports.MirrorChannelCommand = MirrorChannelCommand
