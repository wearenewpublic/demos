import { ScrollView } from "react-native";
import { Pad, PadBox, WideScreen } from "../component/basics";
import { authorRobEnnals } from "../data/authors";
import { ecorp, trek_vs_wars } from "../data/conversations";
import { statusTentative, tagConversation, tagPrivacy } from "../data/tags";
import { getObject, getPersonaKey, modifyObject, useCollection, useObject, usePersonaKey } from "../util/localdata";
import { expandDataList } from "../util/util";
import { TopCommentInput } from "../component/replyinput";
import { ActionLike, ActionReply, Comment, CommentActionButton, CommentContext } from "../component/comment";
import { useContext } from "react";
import { AnonymousFace, FaceImage, UserFace } from "../component/userface";
import { civic_society } from "../data/openhouse_civic";
import { QuietSystemMessage } from "../component/message";

const description = `
Be anonymous to the public, but not to group members.

Anonymity is a powerful tool for free speech, but it can also be used to say 
things that are mean or hurtful.

This prototype lets you be anonymous to the public, but not to group members.
This balances the risk and benefits of anynomity, because it allows you to 
avoid being publicly shamed in front of a large audience, but still allows
the smaller set of group members to hold you accountable for your actions.

`

const persona = {
    memberAlice: {name: 'Alice (Member)', face: 'face9.jpeg', member: true},
    memberBob: {name: 'Bob (Member)', face: 'face10.jpeg', member: true},
    memberLaura: {name: 'Laura (Member)', face: 'face5.jpeg', member: true},
    guestNatalie: {name: 'Natalie', face: 'face4.jpeg'},
    guestTim: {name: 'Tim', face: 'face2.jpeg'},
    guestLarry: {name: 'Larry', face: 'face6.jpeg'},
    guestRita: {name: 'Rita', face: 'face7.jpeg'},
    guestSarah: {name: 'Sarah', face: 'face8.jpeg'},
}


export const SemiAnonymous = {
    key: 'semianonymous',
    name: 'Semi Anonymous',
    author: authorRobEnnals,
    status: statusTentative,
    date: 'Wed Jun 21 2023 20:30:05 GMT-0700 (Pacific Daylight Time)',
    tags: [tagConversation, tagPrivacy],
    description,
    instance: [
        {key: 'civic', name: 'Civic Society, Sunnyvale Chapter', 
            description: 'Welcome to our monthly Open House. This is a great opportunity for non-members to hang out with members, learn about what we do, and see if the Civic Society is a good community for you.',
            '$personaKey': 'guestLarry',
            persona, comment: expandDataList(civic_society)},
    ],
    screen: SemiAnonymousScreen    
}

export function SemiAnonymousScreen() {
    const commentContext = useContext(CommentContext);

    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const topLevelComments = comments.filter(comment => !comment.replyTo);

    const commentConfig = {...commentContext,
        getAuthorName, getAuthorFace,
        commentPlaceholder: 'Write a semi-anonymous comment',
        replyWidgets: [SemiAnonymousExplain]
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

function getIsPublic({comment}) {
    const personaKey = getPersonaKey();
    const fromMember = getObject('persona', comment.from)?.member;
    const userIsMember = getObject('persona', personaKey)?.member;
    return comment.public || fromMember || userIsMember;
}

function getAuthorName({comment}) {
    const personaKey = getPersonaKey();
    if (getIsPublic({comment})) {
        return getObject('persona', comment.from)?.name;
    } else if (comment.from == personaKey) {
        return 'You Semi-Anonymously';
    } else {
        return 'Anonymous Guest';
    }
}

function getAuthorFace({comment, faint}) {
    if (getIsPublic({comment})) {
        return <UserFace userId={comment.from} faint={faint} />
    } else {
        return <AnonymousFace faint={faint} />;
    }
}

function SemiAnonymousExplain() {
    const personaKey = getPersonaKey();
    const userIsMember = getObject('persona', personaKey)?.member;
    if (userIsMember) {
        return <PadBox vert={0} horiz={16} >
            <QuietSystemMessage>As a member, your identity is always public</QuietSystemMessage>
        </PadBox>
    } else {
        return <PadBox vert={0} horiz={16} >
            <QuietSystemMessage>Group members will see your name, but you will be anonymous to everyone else</QuietSystemMessage>
        </PadBox>
    }
}