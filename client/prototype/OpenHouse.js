import { ScrollView } from "react-native";
import { BodyText, Pad, Separator, WideScreen } from "../component/basics";
import { ActionCollapse, ActionLike, ActionReply, Comment, CommentActionButton, CommentContext, CommentDataLabel, MemberAuthorBling } from "../component/comment";
import { TopCommentInput } from "../component/replyinput";
import { civic_society, civic_society_description } from "../data/openhouse_civic";
import { expandDataList } from "../util/util";
import { useContext } from "react";
import { authorRobEnnals } from "../data/authors";
import { useCollection, useDatastore, useGlobalProperty, useObject, usePersonaKey } from "../util/datastore";
import { languageFrench, languageGerman } from "../component/translation";
import { civic_society_description_french, civic_society_french } from "../translations/french/openhouse_civic_french";
import { civic_society_description_german, civic_society_german } from "../translations/german/openhouse_civic_german";
import { memberPersonaList } from "../data/personas";

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
    memberAlice: {name: 'Alice', label: 'Member', face: 'face9.jpeg', member: true},
    memberBob: {name: 'Bob', label: 'Member', face: 'face10.jpeg', member: true},
    memberLaura: {name: 'Laura', label: 'Member', face: 'face5.jpeg', member: true},
    guestNatalie: {name: 'Natalie', face: 'face4.jpeg'},
    guestTim: {name: 'Tim', face: 'face2.jpeg'},
    guestLarry: {name: 'Laura', face: 'face6.jpeg'},
    guestRita: {name: 'Rita', face: 'face7.jpeg'},
    guestSarah: {name: 'Sarah', face: 'face8.jpeg'},
}

export const OpenHousePrototype = {
    key: 'openhouse',
    name: 'Open House Conversation',
    author: authorRobEnnals,
    date: '2023-05-19 15:00:00',
    description,
    screen: OpenHouseScreen,
    instance: [
        {key: 'civic', name: 'Civic Society, Sunnyvale Chapter', 
            description: civic_society_description,
            comment: expandDataList(civic_society)
        },
        {
            key: 'civic-french', name: 'Civic Society, Sunnyvale Chapter (French)', language: languageFrench,
            description: civic_society_description_french,
            comment: expandDataList(civic_society_french)
        },
        {
            key: 'civic-german', name: 'Civic Society, Sunnyvale Chapter (German)', language: languageGerman,
            description: civic_society_description_german,
            comment: expandDataList(civic_society_german)
        },
    ],
    hasMembers: true,
    newInstanceParams: [
        {key: 'description', type: 'longtext', name: 'Description'}
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
                <Pad size={8} />
                <BodyText>{description}</BodyText>
                <Separator />
                <TopCommentInput />
                <CommentContext.Provider value={{...commentContext, actions, getIsDefaultCollapsed, authorBling: [MemberAuthorBling]}}> 
                    {topLevelComments.map(comment => 
                        <Comment key={comment.key} commentKey={comment.key} />
                    )}
                </CommentContext.Provider>
            </ScrollView>
        </WideScreen>
    )   
}

function getIsDefaultCollapsed({datastore, comment}) {
    const fromMember = datastore.getObject('persona', comment.from)?.member;
    return !fromMember && !comment.promotedBy;
}

export function ActionPromote({commentKey, comment}) {
    const personaKey = usePersonaKey();
    const myPersona = useObject('persona', personaKey);
    const fromPersona = useObject('persona', comment?.from);
    const boosterName = useObject('persona', comment?.promotedBy)?.name;
    const datastore = useDatastore();

    function onPromote(promote) {
        datastore.modifyObject('comment', commentKey, comment => ({...comment, promotedBy: promote ? personaKey : null}))    
    }

    if (fromPersona.member) {
        return null;
    } else if (myPersona.member && !comment.promotedBy) {
        return <CommentActionButton key='promote' label='Promote' onPress={() => onPromote(true)} />
    } else if (comment.promotedBy == personaKey) {
        return <CommentActionButton key='promote' label='Un-Promote' onPress={() => onPromote(false)} />
    } else if (comment.promotedBy) {
        return <CommentDataLabel key='promote' text='Promoted by {boosterName}' formatParams={{boosterName}} />
    } else {
        return null;
    }      
}