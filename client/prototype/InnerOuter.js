import { ScrollView } from "react-native";
import { BodyText, EditableText, Pad, SectionTitle, WideScreen } from "../component/basics";
import { authorRobEnnals } from "../data/authors";
import { trek_vs_wars } from "../data/conversations";
import { statusTentative, tagConversation, tagPrivacy } from "../data/tags";
import { getObject, getPersonaKey, setGlobalData, setGlobalProperty, useCollection, useGlobalProperty } from "../util/localdata";
import { expandDataList } from "../util/util";
import { TopCommentInput } from "../component/replyinput";
import { Comment, CommentContext } from "../component/comment";
import { useContext } from "react";
import { QuietSystemMessage } from "../component/message";

const description = `
A private conversation that generates a public conclusion.

The great thing about private conversations is that you can feel safe saying
what's on your mind without worrying about being publicly embarrased for saying
something dumb. The downside is that outsiders don't get to see what you said, and 
so you lose the opportonity to have others join yoru conversation.

In this prototype, the members of a group have a private conversation, but they
can also edit a public 'conclusion' that can be seen by outsiders.

Outsiders can not only see the public conclusion, but can also write their post 
their own messages in response to that conclusion. However outsiders can 
only see messages they wrote themselves, or replies that members wrote to them.

This allows outsiders to contribute to your conversation (and maybe get invited 
to become members) while still keeping the conversation largely private.
`

const persona = {
    'trek': {
        name: 'Trekkie Trisha (Member)', member: true,
        face: 'face7.jpeg'
    },
    'wars': {
        name: 'Star Wars Simon (Member)', member: true,
        face: 'face6.jpeg'
    },
    'guest': {
        name: 'Guest Garry',
        face: 'face2.jpeg'
    }
}


export const InnerOuter = {
    key: 'innerouter',
    name: 'Inner/Outer',
    author: authorRobEnnals,
    status: statusTentative,
    tags: [tagPrivacy, tagConversation],
    date: 'Wed Jun 21 2023 21:14:05 GMT-0700 (Pacific Daylight Time)',
    description,
    instance: [
        {key: 'wars', conclusion: 'Star Wars and Star Trek are both good movies, but they capture different aspects of how the world works',
        persona, name: 'Star Wars vs Star Trek', comment: expandDataList(trek_vs_wars), '$personaKey': 'wars'},
    ],
    screen: InnerOuterScreen   
}

function InnerOuterScreen() {
    const commentContext = useContext(CommentContext);
    const conclusion = useGlobalProperty('conclusion');
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const topLevelComments = comments.filter(comment => !comment.replyTo && getIsVisible({comment}));

    const commentConfig = {...commentContext,
        getIsVisible
    }

    return (
        <WideScreen pad>
            <ScrollView>
                <SectionTitle>Public Conclusion</SectionTitle>
                <EditableText 
                        value={conclusion} 
                        onChange={x => setGlobalProperty('conclusion', x)} 
                        placeholder='What is your group conclusion?' 
                />                
                <Pad size={24}/>

                <SectionTitle>Private Conversation</SectionTitle>

                <TopCommentInput />
                <CommentContext.Provider value={commentConfig}> 
                    {topLevelComments.map(comment => 
                        <Comment key={comment.key} commentKey={comment.key} />
                    )}
                </CommentContext.Provider>

                <Pad size={24}/>
                <QuietSystemMessage>
                    Non-members can only see messages they posted, or 
                    replies to their messages.
                </QuietSystemMessage>
            </ScrollView>
        </WideScreen>
    )
}


function getIsVisible({comment}) {
    const personaKey = getPersonaKey();
    const userIsMember = getObject('persona', personaKey)?.member;

    if (userIsMember) {
        return true;
    } else if (!comment) {
        return false;
    } else if (comment.from == personaKey) {
        return true;
    } else {
        return getIsVisible({comment: getObject('comment', comment.replyTo)});
    }
}

