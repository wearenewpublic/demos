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
import { statusTentative, tagConversation, tagModeration } from "../data/tags";
import { authorRobEnnals } from "../data/authors";

const description = `
A chat app that enforces a list of user-defined rules in a conversation.

Healthy online groups require that members follow the rules of the group. In practice
this often means that human moderators have to expend huge amounts of effort enforcing
the rules of their group.

Some platforms try to fix this by having a central AI enforce a single set of rules for the 
whole platform, but this can be problematic because different groups want to have different 
rules and norms, and because it's "creepy" to have a single central authority deciding the 
rules for everyone on the platform.

In this prototype, we instead allow the members of a group to decide what rules should
be enforced within their group, and an AI responds to messages that appear to break the rules.

This also allows the human moderator to not "have to feel like a bad guy" because the bot
can do the awkward rule enforcement for them.

One limitation of this demo is that it feels awkward to have an AI publicly criticise 
your behavior. We thus plan to create another prototype that talk to the user in private, 
before their rule-breaking messages has been shown to others.
`

const initialRules = `1. Nobody can say anything disrespectful towards any person or group, including implying that they have bad motivations.
2. Any links must be accompanied by the date the link was published, and a summary of what the linked document says.
3. No criticism of cats.
4. No mentioning of vegetables.
`

export const RuleEnforcerChatDemo = {
    key: 'ruleenforcer',
    name: 'Rule Enforcer',
    author: authorRobEnnals,
    date: '2023-05-16',
    description,
    tags: [tagModeration, tagConversation],
    status: statusTentative,
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