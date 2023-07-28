import { ScrollView, Text } from "react-native";
import { Pad, PadBox, WideScreen } from "../component/basics";
import { authorRobEnnals } from "../data/authors";
import { statusTentative, tagConversation, tagPrivacy } from "../data/tags";
import { expandDataList } from "../util/util";
import { TopCommentInput } from "../component/replyinput";
import { ActionLike, ActionReply, Comment, CommentActionButton, CommentContext, GuestAuthorBling, MemberAuthorBling } from "../component/comment";
import { useContext } from "react";
import { AnonymousFace, FaceImage, UserFace } from "../component/userface";
import { civic_society, civic_society_description } from "../data/openhouse_civic";
import { QuietSystemMessage } from "../component/message";
import { useCollection, useObject, usePersonaKey } from "../util/datastore";
import { TranslatableText, languageFrench, languageGerman } from "../component/translation";
import { civic_society_description_french, civic_society_french } from "../translations/french/openhouse_civic_french";
import { civic_society_description_german, civic_society_german } from "../translations/german/openhouse_civic_german";
import { memberPersonaList } from "../data/personas";

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
    memberAlice: {name: 'Alice', label: 'Member', face: 'face9.jpeg', member: true},
    memberBob: {name: 'Bob', label: 'Member', face: 'face10.jpeg', member: true},
    memberLaura: {name: 'Laura', label: 'Member', face: 'face5.jpeg', member: true},
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
            personaList: memberPersonaList, '$personaKey': 'e',
            comment: expandDataList(civic_society)},
        {key: 'civic-french', name: 'Civic Society, Sunnyvale Chapter (French)', language: languageFrench,
            personaList: memberPersonaList, '$personaKey': 'e',
            comment: expandDataList(civic_society_french)
        },
        {key: 'civic-german', name: 'Civic Society, Sunnyvale Chapter (German)', language: languageGerman,
            personaList: memberPersonaList, '$personaKey': 'e',
            comment: expandDataList(civic_society_german)
        },
    ],
    screen: SemiAnonymousScreen    
}

export function SemiAnonymousScreen() {
    const commentContext = useContext(CommentContext);

    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const topLevelComments = comments.filter(comment => !comment.replyTo);

    const commentConfig = {...commentContext,
        authorName: AuthorName, authorFace: AuthorFace,
        commentPlaceholder: 'Write a semi-anonymous comment',
        replyWidgets: [SemiAnonymousExplain],
        authorBling: [MemberAuthorBling]
    }

    // console.log('comments', comments);

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

function getIsPublic({mePersona, authorPersona, comment}) {
    return comment?.public || authorPersona?.member || mePersona?.member;
}

function AuthorName({comment}) {
    const personaKey = usePersonaKey();
    const mePersona = useObject('persona', personaKey);
    const authorPersona = useObject('persona', comment?.from);
    const isPublic = getIsPublic({mePersona, authorPersona, comment});

    if (isPublic) {
        return <Text>{authorPersona?.name}</Text>;
    } else if (comment?.from == personaKey) {
        return <TranslatableText text='You Semi-Anonymously' />;
    } else {
        return <TranslatableText text='Anonymous Guest' />;
    }
}

function AuthorFace({comment, faint}) {
    const personaKey = usePersonaKey();
    const mePersona = useObject('persona', personaKey);
    const authorPersona = useObject('persona', comment?.from);
    const isPublic = getIsPublic({mePersona, authorPersona, comment});

    if (isPublic) {
        return <UserFace userId={comment?.from} faint={faint} />
    } else {
        return <AnonymousFace faint={faint} />;
    }
}

function SemiAnonymousExplain() {
    const personaKey = usePersonaKey();
    const userIsMember = useObject('persona', personaKey)?.member;
    if (userIsMember) {
        return <PadBox vert={0} horiz={16} >
            <QuietSystemMessage text='As a member, your identity is always public' />
        </PadBox>
    } else {
        return <PadBox vert={0} horiz={16} >
            <QuietSystemMessage text='Group members will see your name, but you will be anonymous to everyone else'/>
        </PadBox>
    }
}
