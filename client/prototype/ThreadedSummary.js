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
import { useState } from "react";

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
        summary: 'Both are good',
            comment: expandDataList(trek_vs_wars)},
    ],
    liveInstance: [
        {key: 'live', name: 'Live Conversation', comment: {}}
    ],
    newInstanceParams: []    
}

export function ThreadedSummaryScreen() {
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const topLevelComments = comments.filter(comment => !comment.replyTo);
    const summary = useGlobalProperty('summary');
    const datastore = useDatastore();
    const [inProgress, setInprogress] = useState(false);

    async function computeSummary() {
        console.log('computeSummary', comments);
        const commentsJSON = JSON.stringify(comments);
        setInprogress(true);
        const newSummary = await callServerApiAsync('chatgpt', 'chat', {promptKey: 'summary', params: {commentsJSON}});
        console.log('newSummary', newSummary);
        datastore.setGlobalProperty('summary', newSummary);
        setInprogress(false);
    }

    return (
        <WideScreen pad>
            <ScrollView>
                <Narrow>
                    <Card>
                        <SmallTitleLabel label="Summary" />
                        <Pad/>
                        <EditableText value={summary} onChange={newSummary => datastore.setGlobalProperty('summary', 
                            newSummary)} placeholder='Enter summary' />
                        <Pad/>
                        {inProgress ?
                            <QuietSystemMessage label='Computing summary' />
                        :
                            <PrimaryButton label="Generate New Conversation Summary" onPress={computeSummary} />
                        }
                    </Card>
                </Narrow>
                <Center>
                    <View>
                    <TopCommentInput />
                    {topLevelComments.map(comment => 
                        <Comment key={comment.key} commentKey={comment.key} />
                    )}
                    </View>
                </Center>
            </ScrollView>
        </WideScreen>
    )
}