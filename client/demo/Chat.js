import { View } from "react-native";
import { Pad, WideScreen } from "../component/basics";
import { ChatInput } from "../component/chatinput";
import { Message } from "../component/message";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { expandDataList } from "../shared/util";
import { addObject, useCollection, useGlobalProperty } from "../util/localdata";
import { ecorp, soccer } from "../data/conversations";

export const ChatDemo = {
    key: 'chat',
    name: 'Basic Chat',
    description: 'A simple chat demo. Starting point for more interesting demos.',
    screen: ChatScreen,
    instance: [
        {key: 'ecorp', name: 'E-Corp Alumni', message: expandDataList(ecorp)},
        {key: 'soccer', name: 'Soccer Team', message: expandDataList(soccer)}
    ]
}

export function ChatScreen() {
    const messages = useCollection('message', {sortBy: 'time'});
    const personaKey = useGlobalProperty('$personaKey');

    function onSend(text) {
        addObject('message', {from: personaKey, text})
    }

    return (
        <WideScreen>
            <BottomScroller>
                <Pad size={8} />
                {messages.map(message => 
                    <Message key={message.key} messageKey={message.key}/>
                )}
            </BottomScroller>
            <ChatInput onSend={onSend} />
        </WideScreen>
    )
}

