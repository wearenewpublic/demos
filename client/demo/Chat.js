import { Pad, WideScreen } from "../component/basics";
import { ChatInput } from "../component/chatinput";
import { Message, sendMessage } from "../component/message";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { expandDataList } from "../shared/util";
import { useCollection } from "../util/localdata";
import { abortion, abortion_mediated, ecorp, soccer } from "../data/conversations";
import { statusStartingPoint, tagConversation } from "../data/tags";
import { authorRobEnnals } from "../data/authors";

const description = `
A starting point for demos that involve messenger-like conversations.

In this example, each message is sent by a particular person, and the messages are sorted by time.

Messages are styled similarly to those in messaging apps like iMessage or Facebook Messenger.
`

export const ChatDemo = {
    key: 'chat',
    name: 'Basic Chat',
    author: authorRobEnnals,
    date: '2023-05-04',
    description,
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

