import { Image, StyleSheet, Text, View } from "react-native";
import { Card, Clickable, MaybeCard, PluralText, Separator, TimeText } from "./basics";
import { useCollection, useDatastore, useObject, usePersonaKey } from "../util/datastore";
import { UserFace } from "./userface";
import { TransactionResult } from "firebase/database";
import { TranslatableText } from "./translation";
import { AntDesign, Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { pushSubscreen } from "../util/navigate";
import { addKey, removeKey } from "../util/util";

export function Post({post, fitted=false, childpad=false, noCard=false, actions, hasComments=false, onComment, children}) {
    const s = PostStyle;
    const user = useObject('persona', post.from);
    return <MaybeCard fitted={fitted} isCard={!noCard}>
        <View style={s.authorBox}>
            <UserFace userId={post.from} size={32} />
            <View style={s.authorRight}>
                <Text style={s.authorName}>{user?.name}</Text>
                <TimeText time={post.time} />
            </View>
        </View>
        {post.text ? 
            <Text style={s.text}>{post.text}</Text>
        : null}
        {post.photoUrl ? 
            <Image source={{uri: post.photoUrl}} style={{width: '100%', height: 200, marginTop: 8}} />
        : null}
        <LikesLine post={post} />
        {actions ? 
            <View>
                <Separator pad={12} />
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
        justifyContent: 'space-around'
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
        color: '#444'
    }
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
            <Text style={s.moreText}>View <PluralText count={commentCount} singular='more comment' plural='more comments' /></Text>
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
            <Text style={s.author}>{user.name}</Text>
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


export function PostActionButton({iconName, iconSet, label, onPress}) {
    const s = PostActionButtonStyle;
    return <Clickable onPress={onPress}>
        <View style={s.actionButton}>
            {iconSet ?
                React.createElement(iconSet, {name: iconName, size: 16, color: '#666'})
            : null}   
            <TranslatableText style={s.actionLabel} text={label} />
        </View>
    </Clickable>
}

const PostActionButtonStyle = StyleSheet.create({
    actionButton: {
        flexDirection: 'row',
    },
    actionLabel: {
        marginLeft: 4,
        color: '#666',
        fontSize: 16
    }
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

export function PostActionComment({post}) {
    return <PostActionButton iconName='comment-o' iconSet={FontAwesome} label='Comment' onPress={() => pushSubscreen('post', {postKey: post.key})} />
}

export function LikesLine({post}) {
    const s = LikeLineStyle;
    if (!post.likes) return null;
    const likeCount = Object.keys(post.likes).length;
    if (likeCount == 0) return null;
    return <Text style={s.text}><PluralText count={likeCount} singular='person' plural='people'/> <TranslatableText text='liked this'/> </Text>
}

const LikeLineStyle = StyleSheet.create({
    text: {
        color: '#666',
        marginTop: 8,
    }
});