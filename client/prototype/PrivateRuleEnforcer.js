import { useContext } from "react";
import { expandDataList } from "../util/util";
import { EditableText, Pad, WideScreen } from "../component/basics";
import { ExpandSection } from "../component/expand-section";
import { gptProcessAsync } from "../component/chatgpt";
import { authorRobEnnals } from "../data/authors";
import { TopCommentInput } from "../component/replyinput";
import { ActionLike, ActionReply, BlingLabel, BlingPending, Comment, CommentActionButton, CommentContext } from "../component/comment";
import { ScrollView } from "react-native";
import { cat_club } from "../data/threaded";
import { useCollection, useDatastore, useGlobalProperty, usePersonaKey } from "../util/datastore";
import { languageFrench, languageGerman } from "../component/translation";
import { cat_club_french } from "../translations/french/threaded_french";
import { cat_club_german } from "../translations/german/threaded_german";
import { initialRules_french } from "../translations/french/rules_french";
import { initialRules_german } from "../translations/german/rules_german";
import { personaRobo } from "../data/personas";

const description = `
A treaded conversations where rule-violating comments are hidden.

In the rule enforcer prototype, we explored the idea of having a bot tell people when they violate rules.
This allows a bot to relieve a moderator of a lot of their moderating burden, but
it can feel awkward to be publicly called out for breaking a rule.

In this prototype, we instead have a bot hide rule-violating comments, and privately inform the user about
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

export const PrivateRuleEnforcerPrototype = {
    key: 'privateruleenforcer',
    name: 'Private Rule Enforcer',
    author: authorRobEnnals,
    date: '2023-05-26',
    description,
    screen: PrivateRuleEnforcerScreen,
    instance: [
        {key: 'cats', name: 'The Cat Club', comment: expandDataList(cat_club), rules: initialRules.trim()},
        {
            key: 'cats-french', name: 'The Cat Club (French)', language: languageFrench,
            comment: expandDataList(cat_club_french), rules: initialRules_french.trim()
        },
        {
            key: 'cats-german', name: 'The Cat Club (German)', language: languageGerman,
            comment: expandDataList(cat_club_german), rules: initialRules_german.trim()
        },
    ],
    newInstanceParams: [],
    newInstanceRoboPersonas: {
        robo: personaRobo
    }
}


export function PrivateRuleEnforcerScreen() {
    const commentContext = useContext(CommentContext);
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const rules = useGlobalProperty('rules');
    const datastore = useDatastore();
    const topLevelComments = comments.filter(comment => !comment.replyTo && getIsVisible({datastore, comment}));

    const commentConfig = {...commentContext, 
        postHandler: postHandlerAsync, 
        getIsVisible,
        actions: [ActionReply, ActionLike, ActionPostAnyway],
        topBling: [BlingViolatesRules, BlingPending, BlingForced]
    }

    return (
        <WideScreen pad>
            <ScrollView>
                <Pad />
                <ExpandSection title='Group Rules' defaultOpen>
                    <EditableText 
                        value={rules} 
                        onChange={newRules => datastore.setGlobalProperty('rules', newRules)} placeholder='Enter rules for your group' 
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

async function postHandlerAsync({datastore, post}) {
    const {text, replyTo} = post;
    const rules = datastore.getGlobalProperty('rules');
    const commentKey = datastore.addObject('comment', {...post, pending: true});
    console.log('post', text, replyTo, commentKey);
    const response = await gptProcessAsync({promptKey: 'ruleenforcer', params: {text, rules}});
    console.log('response', response);
    if (response.breaksRule && response.explanation) {
        datastore.addObject('comment', {text: response.explanation, from: 'robo', replyTo: commentKey});
        datastore.modifyObject('comment', commentKey, comment => ({...comment, maybeBad: true, pending: false}))
    } else {
        datastore.modifyObject('comment', commentKey, comment => ({...comment, pending: false}))        
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


function getIsVisible({datastore, comment}) {
    const personaKey = datastore.getPersonaKey();
    if (comment.maybeBad || comment.pending) {
        return (comment.from == personaKey || personaKey == 'i') 
    } else {
        return true;
    }
}

export function ActionPostAnyway({commentKey, comment}) {
    const personaKey = usePersonaKey();
    const datastore = useDatastore();
    function onPostAnyway() {
        datastore.modifyObject('comment', commentKey, comment => ({...comment, postAnyway: true, maybeBad: false}))    
    }

    if (comment.maybeBad && comment.from == personaKey) {
        return <CommentActionButton key='promote' label='Post Anyway' onPress={onPostAnyway} />
    } else {
        return null;
    }
}
