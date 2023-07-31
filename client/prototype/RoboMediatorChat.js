import { Pad, WideScreen } from "../component/basics";
import { ChatInput } from "../component/chatinput";
import { Message, QuietSystemMessage } from "../component/message";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { expandDataList } from "../util/util";
import { soccer, trek_vs_wars } from "../data/conversations";
import { useState } from "react";
import { askGptToEvaluateMessageTextAsync, askGptToRespondToConversationAsync } from "../component/chatgpt";
import { statusTentative, tagConversation, tagModeration } from "../data/tags";
import { authorRobEnnals } from "../data/authors";
import { useCollection, useDatastore } from "../util/datastore";

const description = `
An AI agent acts as a mediator between people who are having difficulty getting along.

It is well known that human mediators can be very effective at helping people to resolve their differences,
however a human mediator is not always available, and human mediation takes up a lot of time.

In this prototype, we explore what happens when an AI agent takes on the role of mediator. 
The agent detects when people are having a conflict, and attempts to help them resolve it.

When using this prototype, we have observed that it can feel "awkward" to have a robot involved in your conversation,
particularly as a public participant, however the robot can be helpful in resolving conflicts.
`

export const RoboMediatorChatPrototype = {
    key: 'robomediator',
    name: 'RoboMediator Chat',
    author: authorRobEnnals,
    date: '2023-05-09',
    description,
    screen: RoboMediatorChatScreen,
    tags: [tagConversation, tagModeration],
    status: statusTentative,
    instance: [
        {key: 'wars', name: 'Star Wars vs Star Trek', message: expandDataList(trek_vs_wars)},
        {key: 'soccer', name: 'Soccer Team', message: expandDataList(soccer)}
    ]
}

export function RoboMediatorChatScreen() {
    const messages = useCollection('message', {sortBy: 'time'});
    const [inProgress, setInProgress] = useState(false);
    const datastore = useDatastore();

    async function onSend(text) {
        setInProgress(true);
        datastore.addObject('message', {text});

        const isUnproductiveMessage = await askGptToEvaluateMessageTextAsync({promptKey: 'conflict', text});
        if (isUnproductiveMessage) {
            const gptMessageText = await askGptToRespondToConversationAsync({datastore, promptKey: 'mediator', messages, newMessageText: text});
            if (gptMessageText) {
                datastore.addObject('message', {text: gptMessageText, from: 'robo'})
            }    
        }

        setInProgress(false);        
    }

    return (
        <WideScreen>
            <BottomScroller>
                <Pad size={8} />
                {messages.map(message => 
                    <Message key={message.key} messageKey={message.key}/>
                )}
            </BottomScroller>
            {inProgress ? 
                <QuietSystemMessage label='RoboMediator is thinking...'/>
            : null}
            <ChatInput onSend={onSend} />
        </WideScreen>
    )
}

