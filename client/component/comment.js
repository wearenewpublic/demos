import { StyleSheet, Text, View } from "react-native";
import { Clickable, Pill } from "./basics";
import { UserFace } from "./userface";
import React, { useContext, useState } from "react";
import { addKey, removeKey } from "../util/util";
import { ReplyInput, TopCommentInput } from "./replyinput";
import { useCollection, useDatastore, useObject, usePersonaKey, useSessionData } from "../util/datastore";
import { TranslatableLabel } from "./translation";


export function CommentActionButton({label, formatParams, onPress}) {
    const s = CommentActionButtonStyle;
    const [hover, setHover] = useState(false);
    return <Clickable style={s.clicker} onHoverChange={setHover}>
        <TranslatableLabel style={!hover ? s.text : [s.text, s.hoverText]} onPress={onPress} label={label} formatParams={formatParams} />
    </Clickable>
}
const CommentActionButtonStyle = StyleSheet.create({
    text: {
        fontSize: 11,
        textTransform: 'uppercase',
        marginTop: 4,
        color: '#666'
    },
    hoverText: {
        color: '#000',
        textDecorationLine: 'underline'
    },
    clicker: {
        marginRight: 32
    }
})

export function CommentDataLabel({text, formatParams}) {
    return <TranslatableLabel style={CommentDataTextStyle.text} label={text} formatParams={formatParams} />
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



export function ActionReply({commentKey}) {
    const datastore = useDatastore();

    function replyToComment(commentKey) {
        datastore.setSessionData('replyToComment', commentKey);
    }
    
    return <CommentActionButton key='reply' label='Reply' onPress={() => replyToComment(commentKey)} />
}


export function ActionLike({commentKey, comment}) {
    const personaKey = usePersonaKey();
    const datastore = useDatastore();
    if (comment?.from == personaKey) return null;
    const actionLabel = comment?.likes?.[personaKey] ? 'Unlike' : 'Like';
    const likeCount = Object.keys(comment?.likes || {}).length;    
    const likeCountLabel = likeCount ? ' (' + likeCount + ')' : '';

    function likeComment(commentKey, comment, personaKey) {
        const shouldLike = !comment.likes?.[personaKey];
        datastore.modifyObject('comment', commentKey, comment => ({
            ...comment, likes: shouldLike ? addKey(comment.likes, personaKey) : removeKey(comment.likes, personaKey)
        }))
    }
    
    return <CommentActionButton key='like' label={actionLabel + '{likeCountLabel}'} formatParams={{likeCountLabel}} onPress={() => likeComment(commentKey, comment, personaKey)} />
}


export function ActionCollapse({commentKey}) {
    const datastore = useDatastore();

    function onCollapse() {
        datastore.setSessionData(['comment', commentKey, 'collapsed'], true);
    }
    return <CommentActionButton key='collapse' label='Collapse' onPress={onCollapse} />
}

export function ActionApprove({commentKey, comment}) {
    const personaKey = usePersonaKey();
    const parentComment = useObject('comment', comment.replyTo);    
    const datastore = useDatastore();

    function onApprove() {
        console.log('approve', commentKey, comment);
        datastore.modifyObject('comment', commentKey, comment => ({...comment, maybeBad: false}))    
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
    if (comment?.pending) {
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

function NullAuthorBling({comment}) {
    return null;
}

function AuthorBlingLabel({label, color='#666'}) {
    return <Pill label={label} style={{color}} />
}

export function MemberAuthorBling({comment}) {
    const author = useObject('persona', comment.from);
    if (author?.member) {
        return <AuthorBlingLabel label='Member' color='#666' />
    } else {
        return null;
    }
}

export function GuestAuthorBling({comment}) {
    const author = useObject('persona', comment.from);
    if (!author?.member) {
        return <AuthorBlingLabel label='Guest' color='#666' />
    } else {
        return null;
    }
}




export const CommentContext = React.createContext({
    actions: defaultActions, 
    topBling: [BlingPending],
    replyComponent: ReplyInput,
    getIsDefaultCollapsed: () => false,
    getIsVisible: () => true,
    authorName: AuthorName,
    authorFace: AuthorFace,
    getCanPost: ({post}) => post.text.length > 0,
    getPrimaryButtonLabel: () => "Post",
    sortComments: ({datastore, comments}) => comments,
    authorBling: [],
    commentPlaceholder: () => 'Write a comment...',
    replyWidgets: [],
    replyTopWidgets: [],
    editExtras: [],
    inputLock: false,
    hideInputOnClick: true
});

function AuthorName({comment}) {
    const persona = useObject('persona', comment.from);
    return <Text>{persona?.name}</Text>
}

function AuthorFace({comment, faint}) {
    return <UserFace userId={comment.from} faint={faint} />
}

export function Comment({commentKey}) {
    const s = CommentStyle;
    const comment = useObject('comment', commentKey);
    const datastore = useDatastore();
    const {actions, replyComponent, getIsDefaultCollapsed, authorFace} = React.useContext(CommentContext);
    const showReplyComponent = useSessionData('replyToComment') == commentKey;
    const sessionCollapsed = useSessionData(['comment', commentKey, 'collapsed']);
    const collapsed = sessionCollapsed ?? getIsDefaultCollapsed({datastore, commentKey, comment});

    function onExpand() {
        datastore.setSessionData(['comment', commentKey, 'collapsed'], false);
    }

    if (!collapsed) {
        return <View style={s.commentHolder}>
            <View style={s.commentLeft}>
                {React.createElement(authorFace, {comment})}
                <View style={s.verticalLine} />
            </View>
            <View style={s.commentRight}>
                <View style={s.commentBox}>
                    <CommentAuthorInfo commentKey={commentKey} />
                    <TopBlingBar commentKey={commentKey} comment={comment} />
                    <Text style={s.text}>{comment?.text}</Text>
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
    const {authorFace} = React.useContext(CommentContext);

    return <Clickable onPress={onPress}>
        <View style={s.commentHolder}>
            <View style={s.commentLeft}>
                {React.createElement(authorFace, {comment, faint: true})}
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
    const datastore = useDatastore();
    const {getIsVisible, sortComments} = React.useContext(CommentContext);
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const replies = comments.filter(c => c.replyTo == commentKey && getIsVisible({datastore, comment: c}));
    const sortedReplies = sortComments({datastore, comments:replies});
    return <View style={s.repliesHolder}>
        {sortedReplies.map(reply => 
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

    const {authorName, authorBling} = React.useContext(CommentContext);
    const comment = useObject('comment', commentKey);

    return <View style={s.authorInfoBox}> 
        <Text style={collapsed ? s.collapsedAuthorName : s.authorName}>
            {React.createElement(authorName, {comment})}
        </Text>
        <View style={{flexDirection: 'row', marginLeft: 4}}>
            {authorBling.map((bling, idx) => 
                React.createElement(bling, {key: idx, comment})
            )}
        </View>
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


export function BasicComments({about = null, config={}}) {
    const datastore = useDatastore();
    const defaultConfig = useContext(CommentContext);
    const newConfig = {...defaultConfig, ...config};
    const comments = useCollection('comment', {sortBy: 'time', reverse: true});
    const topLevelComments = comments.filter(comment => 
        (about ? comment.replyTo == about : !comment.replyTo)
        && newConfig.getIsVisible({datastore, comment}));
 
    const sortedComments = newConfig.sortComments({datastore, comments:topLevelComments})

    return <View>
        <CommentContext.Provider value={newConfig}>
            <TopCommentInput about={about} />
            {sortedComments.map(comment => 
                <Comment key={comment.key} commentKey={comment.key} />
            )}
        </CommentContext.Provider>
    </View>
}
