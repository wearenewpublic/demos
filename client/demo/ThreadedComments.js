import { ScrollView, Text } from "react-native"
import { Pad, WideScreen } from "../component/basics";
import { ActionLike, ActionReply, Comment, actionLike, actionReply } from "../component/comment";
import { expandDataList } from "../shared/util"
import { useCollection, useGlobalProperty } from "../util/localdata";
import { ReplyInput } from "../component/replyinput";

export const ThreadedCommentsDemo = {
    key: 'threaded',
    name: 'Basic Threaded Conversation',
    description: 'A simple threaded conversation demo. Messages expand in a tree.',
    screen: ThreadedScreen,
    instance: [
        {key: 'ecorp', name: 'E-Corp Alumni', comment: expandDataList([
            {key: 'welcome', from: 'leader', text: 'Welcome to the E-Corp Alumni chat room!'},
            {key: 'hate', from: 'angry', replyTo: 'welcome', text: 'I hate E-Corp!'},
            {from: 'peacemaker', replyTo: 'hate', text: 'What concerns do you have? What would you like to see E-Corp do differently?'},
        ])},
        {key: 'soccer', name: 'Soccer Team', comment: expandDataList([
            {key: 'game', from: 'leader', text: 'We have got a game against the Sunnytown Slinkies this weekend!'},
            {from: 'peacemaker', replyTo: 'game', text: 'I hope everyone has a really fun game.'},
            {key: 'boring', from: 'boring', text: "I'm going to say something extremely long and boring that nobody is particularly interested in."},
            {from: 'angry', replyTo: 'boring', text: "Can you shut up. You talk too much."},
            {from: 'boring', text: "I'm going to keep talking because that's what I always do. I keep talking"}
        ])},
    ]    
}

export function ThreadedScreen() {
    const comments = useCollection('comment', {sortBy: 'time'});
    const topLevelComments = comments.filter(comment => !comment.replyTo);

    return (
        <WideScreen pad>
            <ScrollView>
                <Pad size={8} />
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