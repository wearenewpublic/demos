import { useContext, useState } from "react";
import { ecorp, soccer, trek_vs_wars } from "../data/conversations";
import { expandDataList } from "../shared/util";
import { addObject, getGlobalProperty, getPersonaKey, modifyObject, setGlobalProperty, useCollection, useGlobalProperty, usePersonaKey } from "../util/localdata";
import { EditableText, Pad, WideScreen } from "../component/basics";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { Message, QuietSystemMessage, sendMessage } from "../component/message";
import { ChatInput } from "../component/chatinput";
import { ExpandSection } from "../component/expand-section";
import { gptProcessAsync } from "../component/chatgpt";
import { statusTentative, tagConversation, tagModeration } from "../data/tags";
import { authorRobEnnals } from "../data/authors";
import { TopCommentInput } from "../component/replyinput";
import { ActionLike, ActionReply, BlingLabel, BlingPending, Comment, CommentActionButton, CommentContext } from "../component/comment";
import { ScrollView } from "react-native";
import { cat_club } from "../data/threaded";

const description = `
A treaded conversations where rule-violating comments are hidden.

In the rule enforcer demo, we explored the idea of having a bot tell people when they violate rules.
This allows a bot to relieve a moderator of a lot of their moderating burden, but
it can feel awkward to be publicly called out for breaking a rule.

In this demo, we instead have a bot hide rule-violating comments, and privately inform the user about
the reason why their comment violated rules.

If the comment author feels the comment was hidden in error, they can click on the "Post Anyway" button,
which will also reveal the bot's reply to the comment.

Leader Laura is able to see violating posts and the bot's responses to them, so she can tell if the
bot is making mistakes, and can adjust the rules accordingly.
`

const initialRules = `1. Nobody can say anything disrespectful towards any person or group, including implying that they have bad motivations.
2. Any links must be accompanied by the date the link was published, and a summary of what the linked document says.
3. No mentioning of vegetables.
`

export const PrivateRuleEnforcerDemo = {
    key: 'privateruleenforcer',
    name: 'Private Rule Enforcer',
    author: authorRobEnnals,
    date: '2023-05-26 15:00 PST',
    description,
    tags: [tagModeration, tagConversation],
    status: statusTentative,
    screen: PrivateRuleEnforcerScreen,
    instance: [
        {key: 'cats', name: 'The Cat Club', comment: expandDataList(cat_club), rules: initialRules},
    ]
}


export function PrivateRuleEnforcerScreen() {
    const commentContext = useContext(CommentContext);
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const topLevelComments = comments.filter(comment => !comment.replyTo && getIsVisible({comment}));
    const rules = useGlobalProperty('rules');

    const commentConfig = {...commentContext, 
        postHandler: postHandlerAsync, 
        getIsVisible,
        actions: [ActionReply, ActionLike, ActionPostAnyway],
        topBling: [BlingViolatesRules, BlingPending, BlingForced]
    }

    console.log('comments', comments);

    return (
        <WideScreen pad>
            <ScrollView>
                <ExpandSection title='Group Rules'>
                    <EditableText 
                        value={rules} 
                        onChange={newRules => setGlobalProperty('rules', newRules)} placeholder='Enter rules for your group' 
                    />                
                </ExpandSection>
                <Pad size={8} />
                <CommentContext.Provider value={commentConfig}> 
                    <TopCommentInput />
                    {topLevelComments.map(comment => 
                        <Comment key={comment.key} commentKey={comment.key} />
                    )}
                </CommentContext.Provider>
            </ScrollView>
        </WideScreen>
    )   
}

async function postHandlerAsync({text, replyTo}) {
    const rules = getGlobalProperty('rules');
    const personaKey = getPersonaKey();
    const commentKey = addObject('comment', {
        from: personaKey, text, replyTo, pending: true
    })
    console.log('post', text, replyTo, commentKey);
    const response = await gptProcessAsync({promptKey: 'ruleenforcer', params: {text, rules}});
    console.log('response', response);
    if (response.breaksRule && response.explanation) {
        addObject('comment', {text: response.explanation, from: 'robo', replyTo: commentKey});
        modifyObject('comment', commentKey, comment => ({...comment, maybeBad: true, pending: false}))
    } else {
        modifyObject('comment', commentKey, comment => ({...comment, pending: false}))        
    }
}

function BlingViolatesRules({comment}) {
    if (comment.maybeBad) {
        return <BlingLabel color='red' label='Message hidden because it violates rules' />
    }
}

function BlingForced({comment}) {
    if (comment.postAnyway) {
        return <BlingLabel color='blue' label='Message may violate rules.' />
    }
}


function getIsVisible({comment}) {
    const personaKey = getPersonaKey();
    if (comment.maybeBad || comment.pending) {
        return (comment.from == personaKey || personaKey == 'leader') 
    } else {
        return true;
    }
}

export function ActionPostAnyway({commentKey, comment}) {
    const personaKey = usePersonaKey();
    function onPostAnyway() {
        modifyObject('comment', commentKey, comment => ({...comment, postAnyway: true, maybeBad: false}))    
    }

    if (comment.maybeBad && comment.from == personaKey) {
        return <CommentActionButton key='promote' label='Post Anyway' onPress={onPostAnyway} />
    } else {
        return null;
    }
}
