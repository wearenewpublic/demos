import { Pad, WideScreen } from "../component/basics";
import { ChatInput } from "../component/chatinput";
import { Message, QuietSystemMessage, sendMessage } from "../component/message";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { expandDataList } from "../shared/util";
import { useCollection } from "../util/localdata";
import { abortion, soccer } from "../data/conversations";
import { useState } from "react";
import { askGptToEvaluateMessageTextAsync, askGptToRespondToConversationAsync } from "../component/chatgpt";

export const RoboMediatorChatDemo = {
    key: 'robomediator',
    name: 'RoboMediator Chat',
    description: 'A GPT agent takes part in a sequential chat and attempts to mediate in conflicts.',
    screen: RoboMediatorChatScreen,
    instance: [
        {key: 'abortion', name: 'Abortion', message: expandDataList(abortion)},
        {key: 'soccer', name: 'Soccer Team', message: expandDataList(soccer)}
    ]
}

export function RoboMediatorChatScreen() {
    const messages = useCollection('message', {sortBy: 'time'});
    const [inProgress, setInProgress] = useState(false);

    async function onSend(text) {
        setInProgress(true);
        sendMessage({text});

        const isUnproductiveMessage = await askGptToEvaluateMessageTextAsync({promptKey: 'conflict', text});
        if (isUnproductiveMessage) {
            const gptMessageText = await askGptToRespondToConversationAsync({promptKey: 'mediator', messages, newMessageText: text});
            if (gptMessageText) {
                sendMessage({text: gptMessageText, from: 'robo'})
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
                <QuietSystemMessage>RoboMediator is thinking...</QuietSystemMessage>
            : null}
            <ChatInput onSend={onSend} />
        </WideScreen>
    )
}

