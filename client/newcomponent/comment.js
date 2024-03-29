import React, { useContext, useState } from "react";
import { useCollection, useDatastore, useObject, usePersona, usePersonaKey, useSessionData } from "../util/datastore"
import { Byline, FacePile, Persona } from "./people"
import { Card, Divider } from "./basics";
import { HorizBox, Pad } from "../component/basics";
import { Paragraph, TextField } from "./text";
import { CTAButton, ExpanderButton, IconButton, SubtleButton } from "./button";
import { IconEdit, IconReply, IconReport, IconUpvote } from "./icon";
import { pushSubscreen } from "../util/navigate";
import { StyleSheet, View } from "react-native";
import { getFirstName } from "../util/util";

export const CommentContext = React.createContext({
    actions: [ActionReply, ActionUpvote, ActionEdit],
    rightActions: [ActionReport],
    editWidgets: []
})

export function Comment({commentKey}) {
    const comment = useObject('comment', commentKey);
    return <Card>
        <Byline userId={comment.from} time={comment.time} />
        <Pad size={20} />
        <CommentBody commentKey={commentKey} />
        <Pad size={20} />
        <CommentActions commentKey={commentKey} />
        <MaybeCommentReply commentKey={commentKey} />
        <CommentReplies commentKey={commentKey} />
    </Card>
}

export function ReplyComment({commentKey}) {
    const comment = useObject('comment', commentKey);
    return <View>
        <Pad size={20} />
        <Divider />
        <Pad size={20} />
        <Byline type='small' userId={comment.from} time={comment.time} />
        <Pad size={20} />
        <View style={{marginLeft: 40}}>
            <CommentBody commentKey={commentKey} />
            <Pad size={20} />
            <CommentActions commentKey={commentKey} />
            <MaybeCommentReply commentKey={commentKey} />
            <CommentReplies commentKey={commentKey} />
        </View>
    </View>    
}

function CommentBody({commentKey}) {
    const comment = useObject('comment', commentKey);
    const editing = useSessionData(['editComment', commentKey]);
    const [editedComment, setEditedComment] = useState(null);
    const datastore = useDatastore();

    function onEditingDone() {
        setEditedComment(null);
        datastore.setSessionData(['editComment', comment.key], false);
    }

    if (editing) {
        return <EditComment comment={editedComment ?? comment} 
            setComment={setEditedComment} onEditingDone={onEditingDone} />
    } else {
        return <Paragraph text={comment.text.trim()} />
    }
}

function MaybeCommentReply({commentKey}) {
    const replyEnabled = useSessionData(['replyToComment', commentKey]);
    const personaKey = usePersonaKey();
    const [comment, setComment] = useState({text: '', replyTo: commentKey});
    const datastore = useDatastore();
    if (!replyEnabled) return null;

    function onEditingDone() {
        datastore.setSessionData(['replyToComment', comment.replyTo], false);
        datastore.setSessionData(['showReplies', comment.replyTo], true);
        setComment({text: '', replyTo: commentKey})
    }

    return <View>
        <Pad size={20} />
        <Persona userId={personaKey} />
        <Pad size={20} />
        <EditComment commentKey={commentKey} comment={comment} 
            setComment={setComment} onEditingDone={onEditingDone} />
    </View>
}

function EditComment({comment, setComment, onEditingDone}) {
    const replyToComment = useObject('comment', comment.replyTo);
    const author = useObject('persona', replyToComment?.from);
    const datastore = useDatastore();

    function onReply() {
        if (comment.key) {
            datastore.updateObject('comment', comment.key, comment);
        } else {
            datastore.addObject('comment', comment);
        }
        onEditingDone();
    }

    const canPost = comment.text && !comment.blockPost;
    const action = comment.key ? 'Update' : comment.replyTo ? 'Reply' : 'Post';
    const placeholder = comment.replyTo ? 'Reply to {authorName}...' : 'Write a comment...';

    return <View>
        <TextField value={comment.text} onChange={text => setComment({...comment, text})} 
            placeholder={placeholder} 
            placeholderParams={{authorName: getFirstName(author?.name)}} />
        <Pad size={20} />
        <HorizBox center spread>
            <EditWidgets comment={comment} setComment={setComment} />
            <CTAButton label={action} type={canPost ? 'primary' : 'disabled'} onPress={onReply} />
        </HorizBox>    
    </View>
}

function EditWidgets({comment, setComment}) {
    const {editWidgets} = useContext(CommentContext);
    return <HorizBox>
        {editWidgets.map((Widget, idx) => <View key={idx} style={{marginRight: 12}}>
            <Widget comment={comment} setComment={setComment} />
        </View>)} 
    </HorizBox>
}

function CommentReplies({commentKey}) {
    const replies = useCollection('comment', {filter: {replyTo: commentKey}, sortBy: 'time', reverse: true});
    const replyUsers = replies.map(reply => reply.from);
    const expanded = useSessionData(['showReplies', commentKey]);
    const datastore = useDatastore();

    function setExpanded(expanded) {
        datastore.setSessionData(['showReplies', commentKey], expanded);
    }

    if (replies.length == 0) return null;
    
    return <View>
        <Pad size={20} />
        <ExpanderButton userList={replyUsers} label='{count} {noun}' 
            expanded={expanded} setExpanded={setExpanded}
            formatParams={{count: replies.length, singular: 'reply', plural: 'replies'}} />
        {expanded && replies.map(reply => <ReplyComment key={reply.key} commentKey={reply.key} />)}
    </View>
}



function CommentActions({commentKey}) {
    const s = CommentActionsStyle;
    const {actions, rightActions} = useContext(CommentContext);
    return <View style={s.actionBar}>
        <View style={s.mainActions}>
            {actions.map((Action, idx) => <Action key={idx} commentKey={commentKey} />)}
        </View>
        <View style={s.rightActions}>
            {rightActions.map((Action, idx) => <Action key={idx} commentKey={commentKey} />)}
        </View>
    </View>
}
const CommentActionsStyle = StyleSheet.create({
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    mainActions: {
        flexDirection: 'row',
    },
    rightActions: {
        flexDirection: 'row',
    },
    leftAction: {
        marginRight: 20,
    },
    rightAction: {
        marginLeft: 20
    }
})


export function ActionReply({commentKey}) {
    const datastore = useDatastore();

    function onReply() {
        const oldReply = datastore.getSessionData(['replyToComment', commentKey]);
        datastore.setSessionData(['replyToComment', commentKey], !oldReply);
    }

    return <SubtleButton icon={IconReply} label='Reply' onPress={onReply} padRight />
}

export function ActionUpvote({commentKey}) {
    const personaKey = usePersonaKey();
    const comment = useObject('comment', commentKey);
    const upvotes = useCollection('upvote', {filter: {comment: commentKey}});
    const datastore = useDatastore();
    const count = upvotes.length;
    const upvoted = upvotes.some(upvote => upvote.from == personaKey);

    function onUpvote() {
        if (upvoted) {
            const myUpvote = upvotes.find(upvote => upvote.from == personaKey);
            datastore.deleteObject('upvote', myUpvote.key);
        } else {
            datastore.addObject('upvote', {comment: commentKey, from: personaKey});
        }
    }

    if (comment.from == personaKey) return null;

    return <SubtleButton icon={IconUpvote} bold={upvoted}
        label={upvoted ? 'Upvoted {count}' : 'Upvote {count}'} 
        formatParams={{count: count || ''}} onPress={onUpvote} />
}

export function ActionEdit({commentKey}) {
    const datastore = useDatastore();
    const personaKey = usePersonaKey();
    const comment = useObject('comment', commentKey)
    function onEdit() {
        const old = datastore.getSessionData(['editComment', commentKey]);
        datastore.setSessionData(['editComment', commentKey], !old);
    }

    if (comment.from != personaKey) return null;
    return <SubtleButton icon={IconEdit} label='Edit' onPress={onEdit} padRight />
}

export function ActionReport({commentKey}) {
    function onReport() {
        pushSubscreen('report', {commentKey});
    }

    return <SubtleButton icon={IconReport} onPress={onReport}/>
}

function TopCommentEntry({replyTo}) {

}

export function BasicComments({config, about}) {
    const comments = useCollection('comment', {filter: {about}, sortBy: 'time', reverse: true});
    return <View>
        {comments.map(comment => <Comment key={comment.key} commentKey={comment.key} />)}
    </View>
}