import { ScrollView } from "react-native";
import { Pad, WideScreen } from "../component/basics";
import { authorRobEnnals } from "../data/authors";
import { ecorp, trek_vs_wars } from "../data/conversations";
import { statusTentative, tagConversation, tagPrivacy } from "../data/tags";
import { getObject, getPersonaKey, modifyObject, useCollection, useObject, usePersonaKey } from "../util/localdata";
import { expandDataList } from "../util/util";
import { TopCommentInput } from "../component/replyinput";
import { ActionLike, ActionReply, Comment, CommentActionButton, CommentContext } from "../component/comment";
import { useContext } from "react";
import { FaceImage, UserFace } from "../component/userface";

const description = `
Choose whether to be anonymous or not, and toggle between the two.

Sometimes people are afraid to comment publicly using their real name, in case
they say something that other people don't like and which gets them into trouble.

But if you only talk anonymously then you can't gain status when you say things that 
other people do like.

This prototype lets you get the best of both world. You intially write your comment
anonymously, but you can then reveal your name if it seems that your comment is
being well received.
`

export const OptionallyAnonymous = {
    key: 'optionallyanonymous',
    name: 'Optionally Anonymous',
    author: authorRobEnnals,
    status: statusTentative,
    date: 'Wed Jun 21 2023 20:14:05 GMT-0700 (Pacific Daylight Time)',
    tags: [tagConversation, tagPrivacy],
    description,
    instance: [
        {key: 'ecorp', name: 'E-Corp Alumni', comment: expandDataList(ecorp)},
        {key: 'wars', name: 'Star Wars vs Star Trek', comment: expandDataList(trek_vs_wars), '$personaKey': 'wars'},
    ],
    screen: OptionallyAnonymousScreen    
}

export function OptionallyAnonymousScreen() {
    const commentContext = useContext(CommentContext);

    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const topLevelComments = comments.filter(comment => !comment.replyTo);

    const commentConfig = {...commentContext,
        getAuthorName, getAuthorFace,
        commentPlaceholder: 'Write an anonymous comment',
        actions: [ActionReply, ActionLike, ActionToggleAnonymous],
    }


    return (
        <WideScreen pad>
            <ScrollView>
                <CommentContext.Provider value={commentConfig}> 
                    <Pad size={8} />
                    <TopCommentInput />
                        {topLevelComments.map(comment => 
                        <Comment key={comment.key} commentKey={comment.key} />
                    )}
                </CommentContext.Provider>
            </ScrollView>
        </WideScreen>
    )
}

function getAuthorName({comment}) {
    const personaKey = getPersonaKey();
    if (comment.public) {
        return getObject('persona', comment.from)?.name;
    } else if (comment.from == personaKey) {
        return 'You Anonymously';
    } else {
        return 'Anonymous';
    }
}

function getAuthorFace({comment}) {
    if (comment.public) {
        return <UserFace userId={comment.from} />
    } else {
        return <AnonymousFace />;
    }
}

function AnonymousFace() {
    return <FaceImage face='anonymous.jpeg' />
}

function ActionToggleAnonymous({comment}) {
    const personaKey = getPersonaKey();
    if (comment.from != personaKey) {
        return null;
    }

    function toggleAnonymous() {
        modifyObject('comment', comment.key, comment => ({...comment, public: !comment.public}))
    }

    return <CommentActionButton key='anon' label={comment.public ? 'Go Anonymous' : 'Reveal Identity'} onPress={toggleAnonymous} />
}