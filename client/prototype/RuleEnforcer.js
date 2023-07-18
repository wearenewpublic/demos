import { useState } from "react";
import { soccer, trek_vs_wars } from "../data/conversations";
import { expandDataList } from "../util/util";
import { EditableText, Pad, WideScreen } from "../component/basics";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { Message, QuietSystemMessage } from "../component/message";
import { ChatInput } from "../component/chatinput";
import { ExpandSection } from "../component/expand-section";
import { gptProcessAsync } from "../component/chatgpt";
import { statusTentative, tagConversation, tagModeration } from "../data/tags";
import { authorRobEnnals } from "../data/authors";
import { useCollection, useDatastore, useGlobalProperty } from "../util/datastore";
import { trek_vs_wars_german } from "../data/translations/german/conversations_german";

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

One limitation of this prototype is that it feels awkward to have an AI publicly criticise 
your behavior. We thus plan to create another prototype that talk to the user in private, 
before their rule-breaking messages has been shown to others.
`

const initialRules = `1. Nobody can say anything disrespectful towards any person or group, including implying that they have bad motivations.
2. Any links must be accompanied by the date the link was published, and a summary of what the linked document says.
3. No criticism of cats.
4. No mentioning of vegetables.
`

const initialRules_german = `1. Niemand darf einer Person oder Gruppe gegenüber etwas Respektloses sagen, einschließlich der Unterstellung, dass sie schlechte Absichten hat.
2. Alle Links müssen mit dem Datum der Veröffentlichung des Links und einer Zusammenfassung des Inhalts des verlinkten Dokuments versehen sein.
3. Keine Kritik an Katzen.
4. Keine Erwähnung von Gemüse.
`

export const RuleEnforcerChatPrototype = {
    key: 'ruleenforcer',
    name: 'Rule Enforcer',
    author: authorRobEnnals,
    date: '2023-05-16',
    description,
    tags: [tagModeration, tagConversation],
    status: statusTentative,
    screen: RuleEnforcerChatScreen,
    instance: [
        {key: 'wars', name: 'Star Wars vs Star Trek', message: expandDataList(trek_vs_wars), rules: initialRules},
        {key: 'soccer', name: 'Soccer Team', message: expandDataList(soccer), rules: initialRules},
        {key: 'wars-german', name: 'Star Wars vs Star Trek (German)', message: expandDataList(trek_vs_wars_german), rules: initialRules_german},
    ]
}


export function RuleEnforcerChatScreen() {
    const messages = useCollection('message', {sortBy: 'time'});
    const [inProgress, setInProgress] = useState(false);
    const rules = useGlobalProperty('rules');
    const datastore = useDatastore();
    
    async function onSend(text) {
        setInProgress(true);
        datastore.addObject('message', {text});

        const response = await gptProcessAsync({promptKey: 'ruleenforcer', params: {text, rules}});
        if (response.breaksRule && response.explanation) {
            datastore.addObject('message', {text: response.explanation, from: 'robo'});
        }
        setInProgress(false);
    }

    return (
        <WideScreen>
            <ExpandSection title='Group Rules'>
                <EditableText 
                    value={rules} 
                    onChange={text => datastore.setGlobalProperty('rules', text)} 
                    placeholder='Enter rules for your group' 
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