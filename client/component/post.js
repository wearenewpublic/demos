import { Image, StyleSheet, Text, View } from "react-native";
import { Clickable, MaybeCard, MaybeClickable, Pad, PluralLabel, Separator, TimeText } from "./basics";
import { useCollection, useDatastore, useObject, usePersonaKey, useSessionData } from "../util/datastore";
import { UserFace } from "./userface";
import { TranslatableLabel } from "./translation";
import { Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import { pushSubscreen } from "../util/navigate";
import { addKey, removeKey } from "../util/util";
import { AutoSizeTextInput } from "./basics";
import { SectionTitleLabel } from "./basics";
import { PrimaryButton } from "./basics";
import { SecondaryButton } from "./basics";

export function Post({post, onPressAuthor=null, editWidgets=[], saveHandler=null, fitted=false, childpad=false, noCard=false, actions, hasComments=false, onComment, topBling, children}) {
    const s = PostStyle;
    const user = useObject('persona', post.from);
    const editedPost = useSessionData('editPost');
    if (editedPost == post.key) {
        return <PostEditor postKey={post.key} oldPostData={post} editWidgets={editWidgets} saveHandler={saveHandler} fitted={fitted} noCard={noCard} />
    }
    return <MaybeCard fitted={fitted} isCard={!noCard}>
        <MaybeClickable onPress={onPressAuthor} isClickable={onPressAuthor}>
            <View style={s.authorBox}>
                <UserFace userId={post.from} size={32} />
                <View style={s.authorRight}>
                    <Text style={s.authorName}>{user?.name}</Text>
                    <TimeText time={post.time} />
                </View>
            </View>
        </MaybeClickable>
        {topBling ?
           <View style={{marginBottom: 8}}>{topBling}</View>
        : null} 
        {post.text ? 
            <Text style={s.text}>{post.text}</Text>
        : null}
        {post.photoUrl ? 
            <Image source={{uri: post.photoUrl}} style={{width: '100%', height: 200, marginTop: 8}} />
        : null}
        <LikesLine post={post} />
        {actions ? 
            <View>
                <Pad size={12} />
                {/* <Separator pad={8} /> */}
                <View style={s.actionBar}>
                    {actions.map((Action, i) => <Action key={i} post={post} />)}
                </View>
            </View>
        : null}
        {hasComments ? 
            <PostCommentsPreview post={post} onPress={onComment} />
        : null}
        {children ? 
            <View style={{marginTop: childpad ? 12 : 0}}>
                {children}
            </View>
        : null}
    </MaybeCard>
}

const PostStyle = StyleSheet.create({
    actionBar: {
        flexDirection: 'row',
        marginLeft: 8
        // justifyContent: 'space'
    },
    authorBox: {
        flexDirection: 'row',
        marginBottom: 8
    },
    childBox: {
        marginTop: 12
    },
    authorRight: {
        flex: 1,
        marginLeft: 8
    },
    authorName: {
        fontSize: 15,
        fontWeight: 'bold'
    },
    text: {
        marginHorizontal: 2,
        // marginBottom: 12,
        fontSize: 16,
        color: '#444'
    }
})

export function PostEditor({postKey, oldPostData, editWidgets, saveHandler, fitted=false, noCard=false}) {
    const s = PostEditorStyle;
    const [post, setPost] = useState(oldPostData);
    const datastore = useDatastore();

    function onSave() {
        if (saveHandler) {
            saveHandler({datastore, postKey, post});
        } else {
            datastore.modifyObject('post', postKey, () => post);
        }
        datastore.setSessionData('editPost', null);
    }

    function onCancel() {
        datastore.setSessionData('editPost', null);
    }

    return <MaybeCard fitted={fitted} isCard={!noCard}>
        <SectionTitleLabel label='Editing Post' />

        <View>
            {editWidgets.map((Widget, i) => <View key={i} style={{marginBottom: 8}}>
                <Widget key={i} post={post} onPostChanged={setPost} />
            </View>)}
        </View>

        <AutoSizeTextInput style={s.textInput} value={post.text} onChange={text => setPost({...post, text})} />

        <View style={s.actions}>
            <PrimaryButton onPress={onSave} label='Save Changes' />
            <SecondaryButton onPress={onCancel} label='Cancel' />
        </View>
    </MaybeCard>
}

const PostEditorStyle = StyleSheet.create({
    textInput: {
        flex: 1,
        borderRadius: 8, 
        borderWidth: StyleSheet.hairlineWidth, 
        borderColor: '#ddd', padding: 8,
        marginHorizontal: 0,
        fontSize: 15, lineHeight: 20,
        height: 150,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 8,
    },
})


export function PostCommentsPreview({post, onPress}) {
    const s = PostCommentsPreviewStyle;
    const allPostComments = useCollection('comment', {filter: {replyTo: post.key}});
    const topPostComments = useCollection('comment', {filter: {replyTo: post.key}, sortBy: 'time', reverse: true});
    const commentCount = allPostComments.length;
    const shownComment = topPostComments[0];
    if (commentCount == 0) return null;
    return <Clickable onPress={onPress}>
        <Separator pad={12} />
        {shownComment ? 
            <CommentPreview comment={shownComment} />
        : null}
        {commentCount > 1 ?
            <Text style={s.moreText}>View <PluralLabel count={commentCount} singular='more comment' plural='more comments' /></Text>
        : null}
    </Clickable>
}

const PostCommentsPreviewStyle = StyleSheet.create({
    moreText: {
        // marginLeft: 8,
        marginTop: 8,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666'
    }
})

export function CommentPreview({comment}) {
    const s = CommentPreviewStyle;
    const user = useObject('persona', comment.from);
    return <View style={s.commentPreview}>
        <UserFace userId={comment.from} size={32} />
        <View style={s.commentPreviewRight}>
            <Text style={s.author}>{user?.name}</Text>
            <Text numberOfLines={1} style={s.text}>{comment.text}</Text>
        </View>
    </View>
}

const CommentPreviewStyle = StyleSheet.create({
    commentPreview: {
        flexDirection: 'row',
    },
    commentPreviewRight: {
        flex: 1,
        marginLeft: 8,
        backgroundColor: '#eee',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4
    },
    author: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    text: {
        fontSize: 14,
    }
});


export function PostActionButton({iconName, iconSet, label, formatParams, onPress}) {
    const s = PostActionButtonStyle;
    return <Clickable onPress={onPress}>
        <View style={s.actionButton}>
            {iconSet ?
                React.createElement(iconSet, {name: iconName, size: 15, color: '#666'})
            : null}   
            <TranslatableLabel style={s.actionLabel} label={label} formatParams={formatParams} />
        </View>
    </Clickable>
}

const PostActionButtonStyle = StyleSheet.create({
    actionButton: {
        flexDirection: 'row',
        marginRight: 32
    },
    actionLabel: {
        marginLeft: 4,
        color: '#666',
        fontSize: 14
    },
});


export function PostActionLike({post}) {
    const datastore = useDatastore();
    const personaKey = usePersonaKey();
    const hasLike = post.likes?.[personaKey];
    const actionLabel = hasLike ? 'Unlike' : 'Like';
    function likePost() {
        datastore.modifyObject('post', post.key, post => ({
            ...post, likes: hasLike ? removeKey(post.likes, personaKey) : addKey(post.likes, personaKey)
        }));
    }
    return <PostActionButton iconName='thumbs-up' iconSet={Feather} label={actionLabel} onPress={likePost} />
}

export function PostActionUpvote({post}) {
    const datastore = useDatastore();
    const personaKey = usePersonaKey();
    if (personaKey == post.from) return null;
    const hasUpvote = post.upvotes?.[personaKey];
    const actionLabel = hasUpvote ? 'Upvoted{countString}' : 'Upvote{countString}';
    const upvoteCount = Object.keys(post.upvotes || {}).length;
    const countString = upvoteCount == 0 ? '' : ' (' + upvoteCount.toString() + ')';
    function upvotePost() {
        datastore.modifyObject('post', post.key, post => ({
            ...post, upvotes: hasUpvote ? removeKey(post.upvotes, personaKey) : addKey(post.upvotes, personaKey)
        }));
    }
    return <PostActionButton iconName='arrow-up' iconSet={FontAwesome5} label={actionLabel} formatParams={{countString}} onPress={upvotePost} />
}

export function PostActionEdit({post}) {
    const datastore = useDatastore();
    const personaKey = usePersonaKey();

    if (personaKey != post.from) return null;

    function onEdit() {
        datastore.setSessionData('editPost', post.key);
    }

    return <PostActionButton iconName='edit' iconSet={FontAwesome} label='Edit' onPress={onEdit} />
}


export function PostActionComment({post}) {
    return <PostActionButton iconName='comment-o' iconSet={FontAwesome} label='Comment' onPress={() => pushSubscreen('post', {postKey: post.key})} />
}

export function LikesLine({post}) {
    const s = LikeLineStyle;
    if (!post.likes) return null;
    const likeCount = Object.keys(post.likes).length;
    if (likeCount == 0) return null;
    return <Text style={s.text}><PluralLabel count={likeCount} singular='person' plural='people'/> <TranslatableLabel label='liked this'/> </Text>
}

const LikeLineStyle = StyleSheet.create({
    text: {
        color: '#666',
        marginTop: 8,
    }
});