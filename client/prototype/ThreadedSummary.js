import { ScrollView, View } from "react-native"
import { BodyText, Card, Center, EditableText, Narrow, Pad, PrimaryButton, SmallTitleLabel, WideScreen } from "../component/basics";
import { Comment } from "../component/comment";
import { expandDataList } from "../util/util"
import { TopCommentInput } from "../component/replyinput";
import { ecorp, soccer, trek_vs_wars } from "../data/conversations";
import { authorRobEnnals } from "../data/authors";
import { useCollection, useDatastore, useGlobalProperty } from "../util/datastore";
import { callServerApiAsync } from "../util/servercall";
import { QuietSystemMessage } from "../component/message";
import { useEffect, useState } from "react";
import { MaybeArticleScreen } from "../component/article";

const description = `
Generate a summary of a threaded conversation. This summary could be shared externally.
`

export const ThreadedSummaryPrototype = {
    key: 'threadedsummary',
    name: 'Threaded Summary',
    author: authorRobEnnals,
    date: '2023-08-02',
    description,
    screen: ThreadedSummaryScreen,
    instance: [
        {key: 'wars', name: 'Star Wars vs Star Trek', 
            comment: expandDataList(trek_vs_wars)},
        {key: 'wars-split', name: 'Star Wars vs Star Trek (Split)', 
            split: true,
            comment: expandDataList(trek_vs_wars)},
        {key: 'wars-article', name: 'Star Wars vs Star Trek (Article)', 
            articleKey: 'starwars',
            mood: true,
            comment: expandDataList(trek_vs_wars)},

    
    ],
    liveInstance: [
        {key: 'live', name: 'Live Conversation', comment: {}}
    ],
    newInstanceParams: [
        {key: 'split', name: 'Split', type: 'boolean', default: false}
    ]    
}

function SummaryEditor({property, name, prompt}) {
    const value = useGlobalProperty(property);
    const datastore = useDatastore();
    const [inProgress, setInprogress] = useState(false);
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const [canGenerate, setCanGenerate] = useState(true);
    const [commentCount, setComentCount] = useState(0);

    useEffect(() => {
        if (comments.length !== commentCount) {
            setCanGenerate(true);
            setComentCount(comments.length);
        }
    }, [comments]);

    async function computeSummary() {
        const commentsJSON = JSON.stringify(comments);
        setInprogress(true);
        const newSummary = await callServerApiAsync({datastore, component: 'chatgpt', funcname: 'chat', params: {promptKey: prompt, params: {commentsJSON}}});
        datastore.setGlobalProperty(property, newSummary);
        setInprogress(false);
        setCanGenerate(false);
    }

    return <Card>
        <SmallTitleLabel label={name} />
        <Pad/>
        <EditableText value={value || ''} onChange={newValue => datastore.setGlobalProperty(property,newValue)} 
            placeholder={'Enter ' + name} />
        <Pad/>
        {canGenerate ? 
            (inProgress ?
                <QuietSystemMessage label='Computing...' />
            :
                <PrimaryButton label={'Generate New ' + name} onPress={computeSummary} />
            )
        : null}
    </Card>
}

export function ThreadedSummaryScreen() {
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const topLevelComments = comments.filter(comment => !comment.replyTo);
    const split = useGlobalProperty('split');
    const mood = useGlobalProperty('mood');

    return <MaybeArticleScreen articleChildLabel='Conversation'>
        <Narrow>
            {split && 
                <View>
                    <SummaryEditor property='agree' name='Points of Agreement' prompt='agree_points' />
                    <SummaryEditor property='disagree' name='Points of Disagreement' prompt='disagree_points' />
                </View>
            }
            {!split && !mood &&   
                <SummaryEditor property='summary' name='Conversation Summary' prompt='summary' />
            }
            {mood &&
                <View>
                    <SummaryEditor property='agree' name='Points of Agreement' prompt='agree_points' />
                    <SummaryEditor property='moodpoints' name='Conversation Mood' prompt='mood_points' />        
                </View>
            }
        </Narrow>
        <Center>
            <View>
            <TopCommentInput />
            {topLevelComments.map(comment => 
                <Comment key={comment.key} commentKey={comment.key} />
            )}
            </View>
        </Center>
        <Pad size={24}/>
    </MaybeArticleScreen>
}