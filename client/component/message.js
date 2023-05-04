import { StyleSheet, Text, View } from "react-native";
import { newKey, useGlobalProperty, useObject } from "../util/localdata";

export function Message({messageKey}) {
    const s = MessageStyles;
    const message = useObject('message', messageKey);
    const currentUser = useGlobalProperty('$personaKey');

    const fromMe = message.from == currentUser;
    return <View style={[s.messageHolder, fromMe ? s.myMessageHolder : {}]}> 
        <View style={[s.messageBubble, fromMe ? s.myMessageBubble : s.theirMessageBubble]}>
            {fromMe ? null : 
                <MessageAuthorInfo messageKey={messageKey} />
            }
            <Text style={fromMe ? s.myMessageText : {}}>Message: {message.text}</Text>
        </View>
    </View>
}

const MessageStyles = StyleSheet.create({
    messageHolder: {
        flexDirection: 'row',
    },
    myMessageText: {
        color: '#fff'
    },
    myMessageHolder: {
        justifyContent: 'flex-end'
    },
    theirMessageBubble: {
        backgroundColor: '#eee',
        marginRight: 32
    },
    myMessageBubble: {
        backgroundColor: '#0084FF',
        marginLeft: 32
    },
    messageBubble: {
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginVertical: 2,
        marginHorizontal: 8,
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

function BottomScroller({children}) {

}