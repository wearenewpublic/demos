import { ScrollView } from "react-native";
import { Pad, Pill, WideScreen } from "../component/basics";
import { ActionApprove, ActionCollapse, ActionLike, ActionReply, BlingLabel, BlingPending, Comment, CommentContext } from "../component/comment";
import { TopCommentInput } from "../component/replyinput";
import { expandDataList } from "../util/util";
import { useContext } from "react";
import { askGptToEvaluateMessageTextAsync } from "../component/chatgpt";
import { authorRobEnnals } from "../data/authors";
import { trek_vs_wars } from "../data/conversations";
import { useCollection } from "../util/datastore";


const description = `
If the AI thinks your reply is mean, then it will be hidden from other conversaton participants until 
the author of the parent comment approves it.

This is motivated by the fact that moderators often have to spend a lot of time dealing with 
cases where users are having a public fight with each other. It isn't practical for a moderator
to have to manually approve every message that might be mean, but it is practical for the author
of the parent comment to do so. 

We don't want to require the parent commenter to approve all replies because that could give them 
the power to suppress valid criticism, and they may not be available to approve replies in a timely
manner. So we only require approval if the AI thinks the reply is likely to be mean.

One effect of this design is that it encourages people to phrase their replies in a respectful way.

`


export const ParentApproves = {
    key: 'parent-approves',
    name: 'Parent Approves',
    author: authorRobEnnals,
    date: '2023-05-19 20:00:00',
    description,
    screen: ParentApprovesScreen,
    instance: [
        {key: 'wars', name: 'Star Wars vs Star Trek', comment: expandDataList(trek_vs_wars), '$personaKey': 'b'}
    ],
    newInstanceParams: []
}

export function ParentApprovesScreen() {
    const commentContext = useContext(CommentContext);
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const topLevelComments = comments.filter(comment => !comment.replyTo);

    const commentConfig = {...commentContext, 
        actions: [ActionLike, ActionReplyIfNotBad, ActionApprove, ActionCollapse],
        postHandler: postHandlerAsync, 
        getIsVisible,
        topBling: [BlingMaybeBad, BlingPending]
    }

    return (
        <WideScreen pad>
            <ScrollView>
                <TopCommentInput />
                <CommentContext.Provider value={commentConfig}> 
                    {topLevelComments.map(comment => 
                        <Comment key={comment.key} commentKey={comment.key} />
                    )}
                </CommentContext.Provider>
            </ScrollView>
        </WideScreen>
    )   
}

function ActionReplyIfNotBad({commentKey, comment}) {
    if (comment.maybeBad != true) {
        return <ActionReply commentKey={commentKey} comment={comment} />
    } else {
        return null;
    }
}


function getIsVisible({datastore, comment}) {
    const personaKey = datastore.getPersonaKey();
    const parentComment = datastore.getObject('comment', comment.replyTo);    
    if (comment.maybeBad || comment.pending) {
        return (comment.from == personaKey || parentComment.from == personaKey) 
    } else {
        return true;
    }
}

function BlingMaybeBad({comment}) {
    if (comment.maybeBad) {
        return <BlingLabel color='red' label='Needs approval' />
    }
}

async function postHandlerAsync({datastore, post}) {
    console.log('postHandlerAsync', post);
    const {text, replyTo} = post;
    const personaKey = datastore.getPersonaKey();
    const commentKey = datastore.addObject('comment', {...post, pending: true});
    const isUnproductiveMessage = await askGptToEvaluateMessageTextAsync({promptKey: 'conflict', text});
    if (isUnproductiveMessage) {
        datastore.modifyObject('comment', commentKey, comment => ({...comment, maybeBad: true, pending: false}))
    } else {
        datastore.modifyObject('comment', commentKey, comment => ({...comment, pending: false}))
    }
}

