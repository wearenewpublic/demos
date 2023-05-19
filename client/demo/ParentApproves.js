import { ScrollView } from "react-native";
import { Pad, WideScreen } from "../component/basics";
import { ActionApprove, ActionCollapse, ActionLike, ActionReply, BlingPending, Comment, CommentActionButton, CommentBlingText, CommentContext } from "../component/comment";
import { addObject, getObject, getPersonaKey, modifyObject, useCollection, useObject, usePersonaKey } from "../util/localdata";
import { TopCommentInput } from "../component/replyinput";
import { expandDataList } from "../shared/util";
import { useContext } from "react";
import { abortion_reply_approves, threaded_abortion_mediated } from "../data/threaded";
import { askGptToEvaluateMessageTextAsync } from "../component/chatgpt";


export const ParentApproves = {
    key: 'parent-approves',
    name: 'Parent Approves',
    author: 'Rob Ennals',
    date: '2023-05-19 20:00:00',
    description: 'A likely-mean reply must be approved by the author of the parent comment.',
    screen: ParentApprovesScreen,
    instance: [
        {key: 'abortion', name: 'Abortion', comment: expandDataList(abortion_reply_approves), '$personaKey': 'left'},
    ]
}

export function ParentApprovesScreen() {
    const commentContext = useContext(CommentContext);
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const topLevelComments = comments.filter(comment => !comment.replyTo);

    const commentConfig = {...commentContext, 
        actions: [ActionLike, ActionReply, ActionApprove, ActionCollapse],
        postHandler: postHandlerAsync, 
        getIsVisible,
        topBling: [BlingMaybeBad, BlingPending]
    }

    console.log('comments', comments);

    return (
        <WideScreen pad>
            <ScrollView>
                <Pad size={8} />
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

function getIsVisible({comment}) {
    const personaKey = getPersonaKey();
    const parentComment = getObject('comment', comment.replyTo);    
    if (comment.maybeBad || comment.pending) {
        return (comment.from == personaKey || parentComment.from == personaKey) 
    } else {
        return true;
    }
}

function BlingMaybeBad({comment}) {
    if (comment.maybeBad) {
        return <CommentBlingText color='red' label='Needs approval' />
    }
}

async function postHandlerAsync({text, replyTo}) {
    const personaKey = getPersonaKey();
    const commentKey = addObject('comment', {
        from: personaKey, text, replyTo, pending: true
    })
    const isUnproductiveMessage = await askGptToEvaluateMessageTextAsync({promptKey: 'conflict', text});
    if (isUnproductiveMessage) {
        modifyObject('comment', commentKey, comment => ({...comment, maybeBad: true, pending: false}))
    } else {
        modifyObject('comment', commentKey, comment => ({...comment, pending: false}))        
    }
}

