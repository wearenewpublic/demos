import { StyleSheet, Text, View } from "react-native";
import { newKey, useGlobalProperty, useObject } from "../util/localdata";
import { UserFace } from "./userface";

export function Message({messageKey}) {
    const s = MessageStyles;
    const message = useObject('message', messageKey);
    const currentUser = useGlobalProperty('$personaKey');

    console.log('message', message, message.from, currentUser)

    const fromMe = message.from == currentUser;
    return <View style={[s.messageHolder, fromMe ? s.myMessageHolder : {}]}> 
        {fromMe ? null : 
            <UserFace userId={message.from} />
        }
        <View style={[s.messageBubble, fromMe ? s.myMessageBubble : s.theirMessageBubble]}>
            {fromMe ? null : 
                <MessageAuthorInfo messageKey={messageKey} />
            }
            <Text style={fromMe ? s.myMessageText : {}}>{message.text}</Text>
        </View>
    </View>
}

const MessageStyles = StyleSheet.create({
    messageHolder: {
        flexDirection: 'row',
        // alignItems: 'flex-end',
        marginHorizontal: 8,
        marginVertical: 4
    },
    myMessageText: {
        color: '#fff'
    },
    myMessageHolder: {
        justifyContent: 'flex-end',
    },
    theirMessageBubble: {
        backgroundColor: '#eee',
        marginRight: 64
    },
    myMessageBubble: {
        backgroundColor: '#0084FF',
        marginLeft: 64
    },
    messageBubble: {
        borderRadius: 16,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        paddingVertical: 6,
        maxWidth: 500,
        flexShrink: 1
    }
})

function MessageAuthorInfo({messageKey}) {
    const message = useObject('message', messageKey);
    const user = useObject('persona', message.from);
    return <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 2}}> 
        <Text style={{fontWeight: 'bold', fontSize: 12}}>{user.name}</Text>
    </View>
}
