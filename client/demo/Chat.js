import { Pad, WideScreen } from "../component/basics";
import { ChatInput } from "../component/chatinput";
import { Message, sendMessage } from "../component/message";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { expandDataList } from "../shared/util";
import { useCollection } from "../util/localdata";
import { ecorp, soccer } from "../data/conversations";

export const ChatDemo = {
    key: 'chat',
    name: 'Basic Chat',
    author: 'Rob Ennals',
    date: '2023-05-04',
    description: 'A simple chat demo. Starting point for more interesting demos.',
    screen: ChatScreen,
    instance: [
        {key: 'ecorp', name: 'E-Corp Alumni', message: expandDataList(ecorp)},
        {key: 'soccer', name: 'Soccer Team', message: expandDataList(soccer)}
    ]
}

export function ChatScreen() {
    const messages = useCollection('message', {sortBy: 'time'});

    function onSend(text) {
        sendMessage({text});
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

