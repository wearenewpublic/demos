import { ScrollView } from "react-native";
import { BodyText, EditableText, Pad, PadBox, PrimaryButton, SectionTitleLabel, WideScreen } from "../component/basics";
import { authorRobEnnals } from "../data/authors";
import { trek_vs_wars } from "../data/conversations";
import { expandDataList, generateRandomKey } from "../util/util";
import { TopCommentInput } from "../component/replyinput";
import { Comment, CommentContext, GuestAuthorBling, MemberAuthorBling } from "../component/comment";
import { useContext, useState } from "react";
import { QuietSystemMessage } from "../component/message";
import { useCollection, useDatastore, useGlobalProperty, useObject, usePersonaKey } from "../util/datastore";
import { trek_vs_wars_french } from "../translations/french/conversations_french";
import { languageFrench, languageGerman } from "../component/translation";
import { trek_vs_wars_german } from "../translations/german/conversations_german";
import { memberPersonaList } from "../data/personas";
import { callServerApiAsync } from "../util/servercall";
import { MaybeArticleScreen } from "../component/article";
import { trek_wars_article } from "../data/articles/startrekwars";

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

export const InnerOuter = {
    key: 'innerouter',
    name: 'Inner/Outer',
    author: authorRobEnnals,
    date: 'Wed Jun 21 2023 21:14:05 GMT-0700 (Pacific Daylight Time)',
    description,
    hasMembers: true,
    screen: InnerOuterScreen,   
    instance: [
        {
            key: 'wars', conclusion: 'Star Wars and Star Trek are both good movies, but they capture different aspects of how the world works',
            name: 'Star Wars vs Star Trek', comment: expandDataList(trek_vs_wars)
        },
        {
            key: 'wars-article', 
            article: trek_wars_article,
            conclusion: 'Star Wars and Star Trek are both good movies, but they capture different aspects of how the world works',
            name: 'Trek Wars Article', comment: expandDataList(trek_vs_wars)
        },
        {
            key: 'wars_french', language: languageFrench,
            conclusion: 'Star Wars et Star Trek sont tous deux de bons films, mais ils captent différents aspects de comment le monde fonctionne',
            name: 'Star Wars vs Star Trek (French)', comment: expandDataList(trek_vs_wars_french),
        },
        {
            key: 'wars_german', language: languageGerman,
            conclusion: "Star Wars und Star Trek sind beide gute Filme, aber sie erfassen unterschiedliche Aspekte davon, wie die Welt funktioniert.",
            name: 'Star Wars vs Star Trek (German)', comment: expandDataList(trek_vs_wars_german),
        }
    ],
    newInstanceParams: []
}

function InnerOuterScreen() {
    const commentContext = useContext(CommentContext);
    const conclusion = useGlobalProperty('conclusion');
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const datastore = useDatastore();
    const [inProgress, setInprogress] = useState(false);
    const personaKey = usePersonaKey();
    const [editing, setEditing] = useState(false);
    const persona = useObject('persona', personaKey);

    const topLevelComments = comments.filter(comment => !comment.replyTo && getIsVisible({datastore, comment}));

    const commentConfig = {...commentContext,
        getIsVisible, authorBling: [GuestAuthorBling]
    }

    async function generateConclusion() {
        const commentsJSON = JSON.stringify(comments);
        setInprogress(true);
        const newSummary = await callServerApiAsync({datastore, component: 'chatgpt', funcname: 'chat', params: {promptKey: 'agree_points', params: {commentsJSON}}});
        datastore.setGlobalProperty('conclusion', newSummary);
        setInprogress(false);
    }

    return (
        <MaybeArticleScreen articleChildLabel='Community Response'>
        {/* <WideScreen pad>
            <ScrollView> */}
                <Pad size={24}/>
                <SectionTitleLabel label='Public Summary'/>
                <Pad size={4}/>
                {persona.member ? 
                    <EditableText 
                            value={conclusion} 
                            onChange={x => datastore.setGlobalProperty('conclusion', x)} 
                            onChangeEditState={setEditing}
                            placeholder='How would you summarise what was said?' 
                    />  
                    :
                    <BodyText>{conclusion}</BodyText>
                }
                {persona.member && !editing ? 
                    <PadBox>              
                        {inProgress ? 
                            <QuietSystemMessage center={false} label='Computing...' />
                            : 
                            <PrimaryButton label='Generate Public Summary' onPress={generateConclusion}/>
                        }
                    </PadBox>
                : null}
                <Pad size={24}/>

                <SectionTitleLabel label='Private Conversation'/>

                <TopCommentInput />
                <CommentContext.Provider value={commentConfig}> 
                    {topLevelComments.map(comment => 
                        <Comment key={comment.key} commentKey={comment.key} />
                    )}
                </CommentContext.Provider>

                <Pad size={24}/>
                <QuietSystemMessage label='Non-members can only see messages they posted, or replies to their messages.'/>
            {/* </ScrollView>
        </WideScreen> */}
        </MaybeArticleScreen>
    )
}


function getIsVisible({datastore, comment}) {
    const personaKey = datastore.getPersonaKey();
    const userIsMember = datastore.getObject('persona', personaKey)?.member;

    if (userIsMember) {
        return true;
    } else if (!comment) {
        return false;
    } else if (comment?.from == personaKey) {
        return true;
    } else {
        return getIsVisible({datastore, comment: datastore.getObject('comment', comment?.replyTo)});
    }
}

