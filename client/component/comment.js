import { StyleSheet, Text, View } from "react-native";
import { getSessionData, modifyObject, setSessionData, useCollection, useGlobalProperty, useObject, usePersonaKey, useSessionData } from "../util/localdata";
import { Clickable, Pill } from "./basics";
import { UserFace } from "./userface";
import React from "react";
import { addKey, removeKey } from "../util/util";
import { ReplyInput, TopCommentInput } from "./replyinput";



export function CommentActionButton({label, onPress}) {
    const s = CommentActionButtonStyle;
    return <Clickable style={s.clicker}>
        <Text style={s.text} onPress={onPress}>{label}</Text>
    </Clickable>
}
const CommentActionButtonStyle = StyleSheet.create({
    text: {
        fontSize: 11,
        textTransform: 'uppercase',
        // marginRight: 32,
        marginTop: 4,
        color: '#666'
    },
    clicker: {
        marginRight: 32
    }
})

export function CommentDataText({label}) {
    return <Text style={CommentDataTextStyle.text}>{label}</Text>
}
const CommentDataTextStyle = StyleSheet.create({
    text: {
        fontSize: 11,
        textTransform: 'uppercase',
        marginRight: 32,
        marginTop: 4,
        color: '#666'
    }
})


function replyToComment(commentKey) {
    setSessionData('replyToComment', commentKey);
}

export function ActionReply({commentKey}) {
    return <CommentActionButton key='reply' label='Reply' onPress={() => replyToComment(commentKey)} />
}

function likeComment(commentKey, comment, personaKey) {
    const shouldLike = !comment.likes?.[personaKey];
    modifyObject('comment', commentKey, comment => ({
        ...comment, likes: shouldLike ? addKey(comment.likes, personaKey) : removeKey(comment.likes, personaKey)
    }))
}

export function ActionLike({commentKey, comment}) {
    const personaKey = useGlobalProperty('$personaKey');
    if (comment.from == personaKey) return null;
    const actionLabel = comment?.likes?.[personaKey] ? 'Unlike' : 'Like';
    const likeCount = Object.keys(comment?.likes || {}).length;    
    const likeCountLabel = likeCount ? ' (' + likeCount + ')' : '';
    return <CommentActionButton key='like' label={actionLabel + likeCountLabel} onPress={() => likeComment(commentKey, comment, personaKey)} />
}


export function ActionCollapse({commentKey}) {
    function onCollapse() {
        setSessionData(['comment', commentKey, 'collapsed'], true);
    }
    return <CommentActionButton key='collapse' label='Collapse' onPress={onCollapse} />
}

export function ActionApprove({commentKey, comment}) {
    const personaKey = usePersonaKey();
    const parentComment = useObject('comment', comment.replyTo);    

    function onApprove() {
        console.log('approve', commentKey, comment);
        modifyObject('comment', commentKey, comment => ({...comment, maybeBad: false}))    
    }

    if (comment.maybeBad && parentComment?.from == personaKey) {
        return <CommentActionButton key='promote' label='Approve' onPress={onApprove} />
    } else {
        return null;
    }
}

export function BlingLabel({label, color='#666'}) {
    return <View style={{marginVertical: 4}}><Pill label={label} color={color} /></View>
}


export function BlingPending({comment}) {
    if (comment.pending) {
        return <BlingLabel label='Posting...' />
    } else {
        return null;
    }
}


const defaultActions = [ActionLike, ActionReply, ActionCollapse];
function ActionBar({actions, commentKey, comment}) {
    return <View style={{flexDirection: 'row'}}>
        {actions.map((action, idx) => 
            React.createElement(action, {key: idx, commentKey, comment})
        )}
    </View>
}

function TopBlingBar({commentKey, comment}) {
    const {topBling} = React.useContext(CommentContext);
    return <View style={{flexDirection: 'row'}}>
        {topBling.map((bling, idx) => 
            React.createElement(bling, {key: idx, commentKey, comment})
        )}
    </View>
}



export const CommentContext = React.createContext({
    actions: defaultActions, 
    topBling: [BlingPending],
    replyComponent: ReplyInput,
    getIsDefaultCollapsed: () => false,
    getIsVisible: () => true,
    getAuthorName: ({comment}) => useObject('persona', comment.from)?.name,
    getAuthorFace: ({comment, faint}) => <UserFace userId={comment.from} faint={faint} />,
    commentPlaceholder: 'Write a comment...',
    replyWidgets: []
});


export function Comment({commentKey}) {
    const s = CommentStyle;
    const comment = useObject('comment', commentKey);
    const {actions, replyComponent, getIsDefaultCollapsed, getAuthorFace} = React.useContext(CommentContext);
    const showReplyComponent = useSessionData('replyToComment') == commentKey;
    const sessionCollapsed = getSessionData(['comment', commentKey, 'collapsed']);
    const collapsed = sessionCollapsed ?? getIsDefaultCollapsed({commentKey, comment});

    function onExpand() {
        setSessionData(['comment', commentKey, 'collapsed'], false);
    }

    if (!collapsed) {
        return <View style={s.commentHolder}>
            <View style={s.commentLeft}>
                {getAuthorFace({comment})}
                <View style={s.verticalLine} />
            </View>
            <View style={s.commentRight}>
                <View style={s.commentBox}>
                    <CommentAuthorInfo commentKey={commentKey} />
                    <TopBlingBar commentKey={commentKey} comment={comment} />
                    <Text style={s.text}>{comment.text}</Text>
                    <ActionBar actions={actions} commentKey={commentKey} comment={comment} />
                </View>
                {showReplyComponent ? React.createElement(replyComponent, {commentKey}) : null}
                <Replies commentKey={commentKey} />
            </View>
        </View>
    } else {
        return <CollapsedComment commentKey={commentKey} onPress={onExpand} />
    }
}

const CommentStyle = StyleSheet.create({
    commentHolder: {
        flexDirection: 'row',
        marginTop: 16,
    },
    text: {
        fontSize: 15,
        color: '#333',
        maxWidth: 500
    },
    verticalLine: {
        backgroundColor: '#ccc',
        width: 1,
        flex: 1,
        alignSelf: 'center',
        marginTop: 4
    },
    commentRight: {
        flex: 1,
    },
    commentBox: {
        flex: 1,
        marginLeft: 12,
    }
})

function CollapsedComment({commentKey, onPress}) {
    const s = CollapsedCommentStyle;
    const comment = useObject('comment', commentKey);
    const {getAuthorFace} = React.useContext(CommentContext);

    return <Clickable onPress={onPress}>
        <View style={s.commentHolder}>
            <View style={s.commentLeft}>
                {getAuthorFace({comment, faint: true})}
            </View>
            <View style={s.commentRight}>
                <CommentAuthorInfo commentKey={commentKey} collapsed />
                <Text numberOfLines={1} style={s.text}>{comment.text}</Text>
            </View>
        </View>
    </Clickable>
}

const CollapsedCommentStyle = StyleSheet.create({
    commentHolder: {
        flexDirection: 'row',
        marginTop: 16,
    },
    text: {
        fontSize: 13,
        color: '#999',
        maxWidth: 500
    },
    commentRight: {
        flex: 1,
        marginLeft: 12
    },
    commentBox: {
        flex: 1,
        marginLeft: 12,
    }
});

function Replies({commentKey}) {
    const s = RepliesStyle;
    const {getIsVisible} = React.useContext(CommentContext);
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const replies = comments.filter(c => c.replyTo == commentKey && getIsVisible({comment: c}));
    return <View style={s.repliesHolder}>
        {replies.map(reply => 
            <Comment key={reply.key} commentKey={reply.key} />
        )}
    </View>
}

const RepliesStyle = StyleSheet.create({
    repliesHolder: {
    }
})

function CommentAuthorInfo({commentKey, collapsed=false}) {
    const s = CommentAuthorInfoStyle;

    const {getAuthorName} = React.useContext(CommentContext);
    const comment = useObject('comment', commentKey);
    const authorName = getAuthorName({comment});
    return <View style={s.authorInfoBox}> 
        <Text style={collapsed ? s.collapsedAuthorName : s.authorName}>{authorName}</Text>
    </View>
}

const CommentAuthorInfoStyle = StyleSheet.create({
    authorInfoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2
    },
    authorName: {
        fontWeight: 'bold',
        fontSize: 12
    }, 
    collapsedAuthorName: {
        // fontWeight: 'bold',
        fontSize: 12
    }
});


export function BasicComments({about = null}) {
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const topLevelComments = comments.filter(comment => about ? comment.replyTo == about : !comment.replyTo);

    // console.log('comments', comments);

    return <View>
        <TopCommentInput about={about} />
        {topLevelComments.map(comment => 
            <Comment key={comment.key} commentKey={comment.key} />
        )}
    </View>
}