import { ScrollView} from "react-native"
import { WideScreen } from "../component/basics";
import { StickyComment } from "../contrib/zdf/comment";
import { BlingLabel, Comment, CommentContext } from "../component/comment";
import { expandDataList } from "../util/util"
import { TopCommentInput } from "../component/replyinput";
import { trek_vs_wars, trek_vs_wars_constructive } from "../data/conversations";
import { useCollection, useDatastore } from "../util/datastore";
import { QuietSystemMessage } from "../component/message";
import { createContext, useContext, useState } from "react";
import { askGptToEvaluateCommentsWithTopicAsync, askGptToEvaluateHelpAcceptanceAsync, askGptToRespondToCommentsWithTopicAsync, gptProcessAsync } from "../contrib/zdf/chatgpt";
import { authorZDFDigital } from "../data/authors";

const description = `
An AI assistant that helps out when a conversation is stuck.

A conversation may be stuck for any of these reasons:

- Disrespectful or offensive behavior

- Opinions being shared in unproductive ways

- Comments are getting off track

- Comments with too little substance

- Spam comments

- Missing perspectives

Help is displayed in a sticky comment at the top of the thread both to increase visibility and to address the community as a whole instead of singling out users.

The assistant posts optimistic feedback (i.e. "It's great to see so many passionate opinions!") and a new guiding question to get users to focus on something more positive or to deepen the conversation. This approach is intentionally different from a strict moderator. It is not supposed to make users feel like they are being scolded which will hopefully make them more receptive to suggestions.

If users implement the bot's suggestion in their comments, the bot replies and thanks them with a cookie emoji. This is a symbolic reward to make constructive commenters feel seen. The replies are only visible to the person that received the thank-you.
`

export const ConversationHelperPrototype = {
    key: 'conversationhelper',
    name: 'Conversation Helper',
    author: authorZDFDigital,
    date: '2023-10-23',
    description,
    screen: ConversationHelperScreen,
    instance: [
        {key: 'wars', name: 'Star Wars vs Star Trek', comment: expandDataList(trek_vs_wars_constructive)},
    ]
}

const thankYouMessages = [
    "Here, have this cookie as a symbolic thank-you: 🍪",
    "Thanks for commenting! Have this cookie: 🍪",
    "This cookie is just for you: 🍪",
    "You deserve a cookie for that answer! 🍪",
    "Here you go, you deserve this cookie: 🍪",
    "*hands you a cookie* 🍪",
    "I made this cookie just for you, it's still warm! 🍪",
    "This is fresh out of the oven: 🍪 Enjoy!"
];

// TODO: Is this a terrible use of context?
let HelperContext = createContext("Which is better: Star Wars or Star Trek? Share your thoughts and reasons why!");

export function ConversationHelperScreen() {
    const commentContext = useContext(CommentContext);
    const comments = useCollection('comment', { sortBy: 'time', reverse: true });
    const datastore = useDatastore();
    const topLevelComments = comments.filter(comment => !comment.replyTo);
    const [inProgress, setInProgress] = useState(false);

    const commentConfig = {
        ...commentContext,
        postHandler: postHandlerAsync,
        getIsVisible,
        topBling: [BlingThanks]
    }

    // TODO: How to set this dynamically to match the instance name?
    let topic = "Star Wars vs Star Trek";
    const helperContext = useContext(HelperContext);

    // TODO: It would be better to move this analysis into a widget. But then the user has to consciously trigger and wait for the analysis which is not the intention. The analysis should not be disruptive.
    async function postHandlerAsync({ datastore, post }) {
        const {text, replyTo} = post;
        const personaKey = datastore.getPersonaKey();
        const commentKey = datastore.addObject('comment', {
            from: personaKey, text, replyTo
        });

        setInProgress(true);

        // Check if latest comment has implemented the current help suggestion
        const helpAccepted = await askGptToEvaluateHelpAcceptanceAsync({ promptKey: 'conversationhelper_help_accepted', comment: post.text, topic, help: helperContext });

        // Reply with a randomly selected thank-you comment if help was accepted
        if (helpAccepted) {
            let thankYouMessage = thankYouMessages[thankYouMessages.length * Math.random() | 0];
            datastore.addObject('comment', { text: thankYouMessage, from: 'robo', replyTo: commentKey, replyToPersona: personaKey, thanks: true });
        }
        // If not, check if the conversation needs more help
        else {
            // Get only user comments and filter out all bot comments
            let userCommentsText = comments.filter(commentObject => (commentObject.thanks !== true)).map(commentObject => commentObject.text).join("\n\n");

            // A very hacky way to include the latest comment
            userCommentsText = text + "\n\n" + userCommentsText;
            
            const convoNeedsHelp = await askGptToEvaluateCommentsWithTopicAsync({ promptKey: 'conversationhelper_stuck', comments: userCommentsText, topic });
            if (convoNeedsHelp.judgement) {
                const response = await askGptToRespondToCommentsWithTopicAsync({ datastore, promptKey: 'conversationhelper_unstick', comments: userCommentsText, topic, analysis: convoNeedsHelp.explanation });
                if (response) {
                    // TODO: Is this a terrible use of context?
                    HelperContext = createContext(response.helpText);
                }
            }
        }

        setInProgress(false);      
    }

    // Generating a helpful starting question based on the topic
    // TODO: Currently not in use, but might be helpful in the future if we add more example conversations
    async function getStartingQuestion({ datastore }) {
        const response = await gptProcessAsync({ datastore, promptKey: 'question_from_topic', params: { topic } });
        return response.question;
    }

    function getIsVisible({ datastore, comment }) {
        const personaKey = datastore.getPersonaKey();
        if (comment.thanks) {
            // Thank-you comments are only visible to the person who received them
            return (comment.replyToPersona === personaKey);
        } else {
            return true;
        }
    }

    return (
        <WideScreen pad>
            <ScrollView>
                <CommentContext.Provider value={commentConfig}>
                    {inProgress ? 
                        <QuietSystemMessage label='Our robot is baking cookies...'/>
                    : null}
                    <TopCommentInput />
                    <StickyComment text={helperContext}></StickyComment>
                    {topLevelComments.map(comment => 
                        <Comment key={comment.key} commentKey={comment.key} />
                    )}
                </CommentContext.Provider>
            </ScrollView>
        </WideScreen>
    )
}

function BlingThanks({ comment }) {
    if (comment?.thanks) {
        return <BlingLabel label='👁️ Only Visible To You' color="#d0662e" /> // #d0662e #e5a463
    } else {
        return null;
    }
}
