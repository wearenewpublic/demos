import { ScrollView, Text } from "react-native"
import { Pad, WideScreen } from "../component/basics";
import { ActionLike, ActionReply, Comment, actionLike, actionReply } from "../component/comment";
import { expandDataList } from "../shared/util"
import { useCollection, useGlobalProperty } from "../util/localdata";
import { ReplyInput, TopCommentInput } from "../component/replyinput";
import { ecorp, soccer } from "../data/conversations";

export const ThreadedCommentsDemo = {
    key: 'threadedcomments',
    name: 'Threaded Comments',
    author: 'Rob Ennals',
    date: '2023-05-08',
    description: 'A simple threaded conversation demo. Messages expand in a tree.',
    screen: ThreadedScreen,
    instance: [
        {key: 'ecorp', name: 'E-Corp Alumni', comment: expandDataList(ecorp)},
        {key: 'soccer', name: 'Soccer Team', comment: expandDataList(soccer)}
    ]    
}

export function ThreadedScreen() {
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const topLevelComments = comments.filter(comment => !comment.replyTo);

    return (
        <WideScreen pad>
            <ScrollView>
                <Pad size={8} />
                <TopCommentInput />
                {/* <Pad size={4} /> */}
                {topLevelComments.map(comment => 
                    <Comment key={comment.key} commentKey={comment.key} 
                        actions={[ActionLike, ActionReply]} 
                        replyComponent={ReplyInput}
                    />
                )}
            </ScrollView>
        </WideScreen>
    )
}