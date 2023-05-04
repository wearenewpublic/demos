import { View } from "react-native";
import { Pad, WideScreen } from "../component/basics";
import { ChatInput } from "../component/chatinput";
import { Message } from "../component/message";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { expandDataList } from "../shared/util";
import { addObject, useCollection, useGlobalProperty } from "../util/localdata";

export const ChatDemo = {
    key: 'chat',
    name: 'Basic Chat',
    description: 'A simple chat demo. Starting point for more interesting demos.',
    screen: ChatScreen,
    instance: [
        {key: 'ecorp', name: 'E-Corp Alumni', message: expandDataList([
            {from: 'leader', text: 'Welcome to the E-Corp Alumni chat room!'},
            {from: 'angry', text: 'I hate E-Corp!'},
            {from: 'peacemaker', text: 'What concerns do you have? What would you like to see E-Corp do differently?'},
        ])},
        {key: 'soccer', name: 'Soccer Team', message: expandDataList([
            {from: 'leader', text: 'We have got a game against the Sunnytown Slinkies this weekend!'},
            {from: 'peacemaker', text: 'I hope everyone has a really fun game.'},
            {from: 'boring', text: "I'm going to say something extremely long and boring that nobody is particularly interested in."},
            {from: 'angry', text: "Can you shut up. You talk too much."},
            {from: 'boring', text: "I'm going to keep talking because that's what I always do. I keep talking"}
        ])},
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

