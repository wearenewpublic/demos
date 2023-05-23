import { Pad, WideScreen } from "../component/basics";
import { ChatInput } from "../component/chatinput";
import { Message, sendMessage } from "../component/message";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { expandDataList } from "../shared/util";
import { useCollection } from "../util/localdata";
import { abortion, abortion_mediated, ecorp, soccer } from "../data/conversations";
import { statusStartingPoint, tagConversation } from "../data/tags";

export const ChatDemo = {
    key: 'chat',
    name: 'Basic Chat',
    author: 'Rob Ennals',
    date: '2023-05-04',
    description: 'A simple chat demo. Starting point for more interesting demos.',
    tags: [tagConversation],
    status: statusStartingPoint,
    screen: ChatScreen,
    instance: [
        {key: 'ecorp', name: 'E-Corp Alumni', message: expandDataList(ecorp)},
        {key: 'soccer', name: 'Soccer Team', message: expandDataList(soccer)},
        {key: 'abortion', name: 'Abortion', message: expandDataList(abortion)},
        {key: 'abortion-mediated', name: 'Abortion (mediated)', message: expandDataList(abortion_mediated)},
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

