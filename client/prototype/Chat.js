import { Pad, WideScreen } from "../component/basics";
import { ChatInput } from "../component/chatinput";
import { Message, sendMessage } from "../component/message";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { expandDataList } from "../util/util";
import { ecorp, soccer, trek_vs_wars } from "../data/conversations";
import { statusStartingPoint, tagConversation } from "../data/tags";
import { authorRobEnnals } from "../data/authors";
import { useCollection, useDatastore } from "../util/datastore";

const description = `
A starting point for prototypes that involve messenger-like conversations.

In this example, each message is sent by a particular person, and the messages are sorted by time.

Messages are styled similarly to those in messaging apps like iMessage or Facebook Messenger.
`

export const ChatPrototype = {
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
        {key: 'starwars', name: 'Star Wars vs Star Trek', message: expandDataList(trek_vs_wars)}
    ]
}

export function ChatScreen() {
    const messages = useCollection('message', {sortBy: 'time'});
    const datastore = useDatastore();

    console.log('ChatScreen', {messages, datastore, dataTree: datastore.dataTree, dataMessages: datastore.dataTree.message});

    function onSend(text) {
        console.log('adding message', text);
        datastore.addObject('message', {text});
        console.log('added', datastore);
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

