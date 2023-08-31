import { useContext } from "react";
import { expandDataList } from "../util/util";
import { Pad, WideScreen } from "../component/basics";
import { gptProcessAsync } from "../component/chatgpt";
import { authorZDFDigital } from "../data/authors";
import { TopCommentInput } from "../component/replyinput";
import { ActionLike, ActionReply, BlingLabel, BlingPending, Comment, CommentActionButton, CommentContext } from "../component/comment";
import { ScrollView } from "react-native";
import { godzilla_comments_threaded } from "../data/threaded";
import { useCollection, useDatastore, usePersonaKey } from "../util/datastore";
import { godzilla_article } from "../data/articles/godzilla";

const description = `
A treaded conversations where rule-violating comments are hidden.

In the cheeky chat bot prototype, we explored the idea of having a bot give cheeky responses to users violating the rules.
The bot will act and look like a regular user and tries to bring the conversation back on track.

This allows a bot to relieve a moderator of a lot of their moderating burden, but
it can feel awkward to be publicly called out for breaking a rule.

In this prototype, we instead have a bot hide rule-violating comments, and privately nag the user about
the reason why their comment violated rules. Additionally, the user that wrote the rule-violating comment
does not notice that his comment was hidden from others in the first place.

This prototype should feel like a regular conversation to the offending user and as a result waste
the time of the offending person without interrupting the conversation for everyone else.

Ingrid Ishida is able to see violating posts and the bot's responses to them. Ingrid Ishida also has the ability
to allow potentially offending posts in case the bot might have made a mistake.
`

const rules = `1. Nobody can say anything disrespectful towards any person or group, including implying that they have bad motivations.
`

export const CheekyChatBotPrototype = {
    key: 'cheekychatbot',
    name: 'Cheeky Chat Bot',
    author: authorZDFDigital,
    date: '2023-07-24',
    description,
    screen: CheekyChatBotScreen,
    instance: [
        { key: 'godzilla', name: 'Godzilla', article: godzilla_article, comment: expandDataList(godzilla_comments_threaded) }
    ]
}

export function CheekyChatBotScreen() {
    const commentContext = useContext(CommentContext);
    const comments = useCollection('comment', { sortBy: 'time', reverse: true });
    const datastore = useDatastore();
    const topLevelComments = comments.filter(comment => !comment.replyTo && getIsVisible({ datastore, comment }));

    const commentConfig = {
        ...commentContext,
        postHandler: postHandlerAsync,
        getIsVisible,
        actions: [ActionReply, ActionLike, ActionPostAnyway],
        topBling: [BlingPending, BlingForced]
    }

    return (
        <WideScreen pad>
            <ScrollView>
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

async function postHandlerAsync({ datastore, post }) {
    const {text, replyTo} = post;
    const personaKey = datastore.getPersonaKey();
    const commentKey = datastore.addObject('comment', {
        from: personaKey, text, replyTo, pending: true
    })
    const response = await gptProcessAsync({ promptKey: 'cheekychatbot', params: { text, username: personaKey, rules } });
    if (response.breaksRule && response.username && response.message) {
        const personaKey = response.username.toLowerCase();
        if (!datastore.getObject('persona', personaKey)) {
            datastore.setObject('persona', personaKey, {
                face: `anonymous.jpeg`,
                name: response.username
            });
        }
        datastore.addObject('comment', { text: response.message, from: personaKey, replyTo: commentKey });
        datastore.modifyObject('comment', commentKey, comment => ({ ...comment, maybeBad: true, pending: false }))
    } else {
        datastore.modifyObject('comment', commentKey, comment => ({ ...comment, pending: false }))
    }
}

function BlingForced({ comment }) {
    if (comment.postAnyway) {
        return <BlingLabel color='blue' label='Message may violate rules.' />
    }
}

function getIsVisible({ datastore, comment }) {
    const personaKey = datastore.getPersonaKey();
    if (comment.maybeBad || comment.pending) {
        return (comment.from == personaKey || personaKey == 'i')
    } else {
        return true;
    }
}

export function ActionPostAnyway({ commentKey, comment }) {
    const personaKey = usePersonaKey();
    const datastore = useDatastore();
    function onPostAnyway() {
        datastore.modifyObject('comment', commentKey, comment => ({ ...comment, postAnyway: true, maybeBad: false }))
    }

    if ((comment.maybeBad || comment.pending) && personaKey == 'i') {
        return <CommentActionButton key='promote' label='Allow Post' onPress={onPostAnyway} />
    } else {
        return null;
    }
}
