import { ScrollView } from "react-native";
import { Pad, Pill, WideScreen } from "../component/basics";
import { ActionApprove, ActionCollapse, ActionLike, ActionReply, BlingLabel, BlingPending, Comment, CommentContext } from "../component/comment";
import { addObject, getObject, getPersonaKey, modifyObject, useCollection } from "../util/localdata";
import { TopCommentInput } from "../component/replyinput";
import { expandDataList } from "../shared/util";
import { useContext } from "react";
import { askGptToEvaluateMessageTextAsync } from "../component/chatgpt";
import { statusTentative, tagConversation, tagModeration } from "../data/tags";
import { authorRobEnnals } from "../data/authors";
import { trek_vs_wars } from "../data/conversations";


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
    tags: [tagConversation, tagModeration],
    status: statusTentative,
    instance: [
        {key: 'wars', name: 'Star Wars vs Star Trek', comment: expandDataList(trek_vs_wars), '$personaKey': 'wars'}
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
        return <BlingLabel color='red' label='Needs approval' />
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

