import { StyleSheet, Text, View } from "react-native";
import { modifyObject, setSessionData, useCollection, useGlobalProperty, useObject, useSessionData } from "../util/localdata";
import { Clickable } from "./basics";
import { UserFace } from "./userface";
import React from "react";
import { addKey, removeKey } from "../shared/util";
import { ReplyInput } from "./replyinput";


export function CommentActionButton({label, onPress}) {
    const s = CommentActionButtonStyle;
    return <Clickable>
        <Text style={s.text} onPress={onPress}>{label}</Text>
    </Clickable>
}
const CommentActionButtonStyle = StyleSheet.create({
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
    const actionLabel = comment?.likes?.[personaKey] ? 'Unlike' : 'Like';
    const likeCount = Object.keys(comment?.likes || {}).length;    
    const likeCountLabel = likeCount ? ' (' + likeCount + ')' : '';
    return <CommentActionButton key='like' label={actionLabel + likeCountLabel} onPress={() => likeComment(commentKey, comment, personaKey)} />
}

const defaultActions = [ActionLike, ActionReply];
function ActionBar({actions, commentKey, comment}) {
    return <View style={{flexDirection: 'row'}}>
        {actions.map((action, idx) => 
            React.createElement(action, {key: idx, commentKey, comment})
        )}
    </View>
}

export function Comment({commentKey, actions=defaultActions, replyComponent=ReplyInput}) {
    const s = CommentStyle;
    const comment = useObject('comment', commentKey);
    const showReplyComponent = useSessionData('replyToComment') == commentKey;
    return <View style={s.commentHolder}>
        <View style={s.commentLeft}>
            <UserFace userId={comment.from} />
            <View style={s.verticalLine} />
        </View>
        <View style={s.commentRight}>
            <View style={s.commentBox}>
                <CommentAuthorInfo commentKey={commentKey} />
                <Text style={s.text}>{comment.text}</Text>
                <ActionBar actions={actions} commentKey={commentKey} comment={comment} />
            </View>
            {showReplyComponent ? React.createElement(replyComponent, {commentKey}) : null}
            <Replies commentKey={commentKey} actions={actions} replyComponent={replyComponent} />
        </View>
    </View>
}

const CommentStyle = StyleSheet.create({
    commentHolder: {
        flexDirection: 'row',
        // marginHorizontal: 8,
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

function Replies({commentKey, actions, replyComponent}) {
    const s = RepliesStyle;
    const comments = useCollection('comment', {sortBy: 'time'});
    const replies = comments.filter(c => c.replyTo == commentKey);
    return <View style={s.repliesHolder}>
        {replies.map(reply => 
            <Comment key={reply.key} commentKey={reply.key} 
                actions={actions} replyComponent={replyComponent}/>
        )}
    </View>
}

const RepliesStyle = StyleSheet.create({
    repliesHolder: {
    }
})

function CommentAuthorInfo({commentKey}) {
    const s = CommentAuthorInfoStyle;
    const comment = useObject('comment', commentKey);
    const user = useObject('persona', comment.from);
    return <View style={s.authorInfoBox}> 
        <Text style={s.authorName}>{user.name}</Text>
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
    }
});
