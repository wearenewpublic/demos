import { View } from "react-native";
import { Message } from "../component/message";
import { expandDataList } from "../shared/util";
import { useCollection } from "../util/localdata";

export const ChatDemo = {
    key: 'chat',
    name: 'Basic Chat',
    description: 'A simple chat demo. Starting point for more interesting demos.',
    screen: ChatScreen,
    instance: [
        {key: 'ecorp', name: 'E-Corp Alumni', message: expandDataList([
            {from: 'leader', text:'Welcome to the E-Corp Alumni chat room!'},
            {from: 'angry', text:'I hate E-Corp!'}
        ])},
    ]
}

export function ChatScreen() {
    const messages = useCollection('message', {sortBy: 'time'});
    return (
        <View style={{flex: 1}}>
            {messages.map(message => 
                <Message key={message.key} messageKey={message.key}/>
            )}
        </View>
    )
}

