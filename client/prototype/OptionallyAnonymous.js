import { ScrollView, Text } from "react-native";
import { Pad, WideScreen } from "../component/basics";
import { authorRobEnnals } from "../data/authors";
import { ecorp, trek_vs_wars } from "../data/conversations";
import { expandDataList } from "../util/util";
import { TopCommentInput } from "../component/replyinput";
import { ActionLike, ActionReply, Comment, CommentActionButton, CommentContext } from "../component/comment";
import { useContext } from "react";
import { AnonymousFace, FaceImage, UserFace } from "../component/userface";
import { useCollection, useDatastore, useObject, usePersonaKey } from "../util/datastore";
import { trek_vs_wars_french } from "../translations/french/conversations_french";
import { TranslatableLabel, languageFrench, languageGerman } from "../component/translation";
import { trek_vs_wars_german } from "../translations/german/conversations_german";

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
    date: 'Wed Jun 21 2023 20:14:05 GMT-0700 (Pacific Daylight Time)',
    description,
    instance: [
        {key: 'ecorp', name: 'E-Corp Alumni', comment: expandDataList(ecorp)},
        {key: 'wars', name: 'Star Wars vs Star Trek', comment: expandDataList(trek_vs_wars), '$personaKey': 'b'},
        {key: 'wars-french', name: 'Star Wars vs Star Trek (French)', language: languageFrench, comment: expandDataList(trek_vs_wars_french), '$personaKey': 'b'},
        {key: 'wars-german', name: 'Star Wars vs Star Trek (German)', language: languageGerman, comment: expandDataList(trek_vs_wars_german), '$personaKey': 'b'},
    ],
    screen: OptionallyAnonymousScreen,
    newInstanceParams: []
}

export function OptionallyAnonymousScreen() {
    const commentContext = useContext(CommentContext);

    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const topLevelComments = comments.filter(comment => !comment.replyTo);

    const commentConfig = {...commentContext,
        authorName: AuthorName, authorFace: AuthorFace,
        commentPlaceholder: 'Write an anonymous comment',
        actions: [ActionReply, ActionLike, ActionToggleAnonymous],
    }


    return (
        <WideScreen pad>
            <ScrollView>
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

function AuthorName({comment}) {
    const personaKey = usePersonaKey();
    const authorPersona = useObject('persona', comment.from);
    if (comment.public) {
        return <Text>{authorPersona?.name}</Text>;
    } else if (comment.from == personaKey) {
        return <TranslatableLabel label='You Anonymously' />;
    } else {
        return <TranslatableLabel label='Anonymous' />;
    }
}

function AuthorFace({comment, faint}) {
    if (comment.public) {
        return <UserFace userId={comment.from} faint={faint} />
    } else {
        return <AnonymousFace faint={faint} />;
    }
}

function ActionToggleAnonymous({comment}) {
    const personaKey = usePersonaKey();
    const datastore = useDatastore();

    if (comment.from != personaKey) {
        return null;
    }

    function toggleAnonymous() {
        datastore.modifyObject('comment', comment.key, comment => ({...comment, public: !comment.public}))
    }

    return <CommentActionButton key='anon' label={comment.public ? 'Go Anonymous' : 'Reveal Identity'} onPress={toggleAnonymous} />
}
