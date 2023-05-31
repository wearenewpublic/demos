import { ScrollView } from "react-native";
import { BodyText, Pad, Separator, WideScreen } from "../component/basics";
import { ActionCollapse, ActionLike, ActionReply, Comment, CommentActionButton, CommentContext, CommentDataText } from "../component/comment";
import { getObject, modifyObject, useCollection, useGlobalProperty, useObject, usePersonaKey } from "../util/localdata";
import { TopCommentInput } from "../component/replyinput";
import { civic_society } from "../data/openhouse_civic";
import { expandDataList } from "../shared/util";
import { useContext } from "react";
import { statusTentative, tagAudioVideo, tagConversation, tagModeration, tagOnboarding } from "../data/tags";
import { authorRobEnnals } from "../data/authors";

const description = `
Members of a group can talk with non-members, but messages from non-members will appear in a
quiet way unless their messages are explicitly promoted by a member.

Often the members of a group will want to be able to engage in conversation with outsiders.
For example they might want to talk with people who might be future members, or a panel
of experts might want to talk with members of an audience.

When this is done on conventional platforms, the conversation will often get taken over by
non-members who misbehave, either by spamming, by being rude, or just posting low value
content.

This design is influenced by the structure of in-person "panel" events, where a group of 
experts on stage will invite contributions from the audience, but the panel (or their moderator)
controls who gets to speak and when.
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

export const OpenHousePrototype = {
    key: 'openhouse',
    name: 'Open House Conversation',
    author: authorRobEnnals,
    date: '2023-05-19 15:00:00',
    description,
    tags: [tagConversation, tagModeration, tagOnboarding],
    status: statusTentative,
    screen: OpenHouseScreen,
    instance: [
        {key: 'civic', name: 'Civic Society, Sunnyvale Chapter', 
            description: 'Welcome to our monthly Open House. This is a great opportunity for non-members to hang out with members, learn about what we do, and see if the Civic Society is a good community for you.',
            persona, comment: expandDataList(civic_society)},
    ]
}

export function OpenHouseScreen() {
    const commentContext = useContext(CommentContext);
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const description = useGlobalProperty('description');
    const topLevelComments = comments.filter(comment => !comment.replyTo);
    const actions = [ActionLike, ActionReply, ActionPromote, ActionCollapse]

    return (
        <WideScreen pad>
            <ScrollView>
                <BodyText>{description}</BodyText>
                <Separator />
                <Pad size={8} />
                <TopCommentInput />
                <CommentContext.Provider value={{...commentContext, actions, getIsDefaultCollapsed}}> 
                    {topLevelComments.map(comment => 
                        <Comment key={comment.key} commentKey={comment.key} />
                    )}
                </CommentContext.Provider>
            </ScrollView>
        </WideScreen>
    )   
}

function getIsDefaultCollapsed({comment}) {
    const fromMember = getObject('persona', comment.from)?.member;
    return !fromMember && !comment.promotedBy;
}

export function ActionPromote({commentKey, comment}) {
    const personaKey = usePersonaKey();
    const myPersona = useObject('persona', personaKey);
    const fromPersona = useObject('persona', comment?.from);
    const boosterName = useObject('persona', comment?.promotedBy)?.name;

    function onPromote(promote) {
        modifyObject('comment', commentKey, comment => ({...comment, promotedBy: promote ? personaKey : null}))    
    }

    if (fromPersona.member) {
        return null;
    } else if (myPersona.member && !comment.promotedBy) {
        return <CommentActionButton key='promote' label='Promote' onPress={() => onPromote(true)} />
    } else if (comment.promotedBy == personaKey) {
        return <CommentActionButton key='promote' label='Un-Promote' onPress={() => onPromote(false)} />
    } else if (comment.promotedBy) {
        return <CommentDataText key='promote' label={`Promoted by ${boosterName}`} />
    } else {
        return null;
    }      
}