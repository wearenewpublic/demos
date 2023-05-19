import { useState } from "react";
import { abortion, soccer } from "../data/conversations";
import { expandDataList } from "../shared/util";
import { useCollection, useGlobalProperty } from "../util/localdata";
import { EditableText, Pad, WideScreen } from "../component/basics";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { Message, QuietSystemMessage, sendMessage } from "../component/message";
import { ChatInput } from "../component/chatinput";
import { ExpandSection } from "../component/expand-section";
import { gptProcessAsync } from "../component/chatgpt";

const initialRules = `1. Nobody can say anything disrespectful towards any person or group, including implying that they have bad motivations.
2. Any links must be accompanied by the date the link was published, and a summary of what the linked document says.
3. No criticism of cats.
4. No mentioning of vegetables.
`

export const RuleEnforcerChatDemo = {
    key: 'ruleenforcer',
    name: 'Rule Enforcer',
    author: 'Rob Ennals',
    date: '2023-05-16',
    description: 'A chat app that enforces a list of user-defined rules in a conversation',
    screen: RuleEnforcerChatScreen,
    instance: [
        {key: 'abortion', name: 'Abortion', message: expandDataList(abortion), rules: initialRules},
        {key: 'soccer', name: 'Soccer Team', message: expandDataList(soccer), rules: initialRules}
    ]
}


export function RuleEnforcerChatScreen() {
    const messages = useCollection('message', {sortBy: 'time'});
    const [inProgress, setInProgress] = useState(false);
    const initialRules = useGlobalProperty('rules');
    const [rules, setRules] = useState(initialRules);

    async function onSend(text) {
        setInProgress(true);
        sendMessage({text});

        const response = await gptProcessAsync({promptKey: 'ruleenforcer', params: {text, rules}});
        if (response.breaksRule && response.explanation) {
            sendMessage({text: response.explanation, from: 'robo'});
        }
        setInProgress(false);
    }

    return (
        <WideScreen>
            <ExpandSection title='Group Rules'>
                <EditableText 
                    value={rules} 
                    onChange={setRules} placeholder='Enter rules for your group' 
                />                
            </ExpandSection>
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