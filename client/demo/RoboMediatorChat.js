import { View } from "react-native";
import { Pad, WideScreen } from "../component/basics";
import { ChatInput } from "../component/chatinput";
import { Message, QuietSystemMessage } from "../component/message";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { expandDataList } from "../shared/util";
import { addObject, useCollection, useCollectionMap, useGlobalProperty } from "../util/localdata";
import { abortion, ecorp, soccer } from "../data/conversations";
import { callServerApiAsync } from "../util/servercall";
import { useState } from "react";

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
    const personas = useCollectionMap('persona');
    const personaKey = useGlobalProperty('$personaKey');
    const [inProgress, setInProgress] = useState(false);

    async function onSend(text) {
        addObject('message', {from: personaKey, text})
        setInProgress(true);
        const messagesText = messagesToGptString(personas, [...messages, {from: personaKey, text}]);
        console.log('messagesText', messagesText)
        try {
            const gptResponse = await callServerApiAsync('chatgpt', 'chat', {promptKey: 'robomediator', messagesText});
            if (gptResponse.actionNeeded) {
                addObject('message', {from: 'robo', text: gptResponse.messageText});
            }
        } catch (error) {
            console.error('error in gpt call', error);
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

function messagesToGptString(personas, messages) {
    return messages.map(message => personas[message.from].name + ': ' + JSON.stringify(message.text)).join('\n\n');
}