
import { Image, Switch, Text, View } from "react-native";
import { MaybeArticleScreen } from "../component/article";
import { BigTitle, BodyText, Card, Center, Clickable, EditableText, HorizBox, HoverRegion, InfoBox, ListItem, MaybeEditableText, Narrow, Pad, PadBox, Pill, PluralLabel, PreviewText, ScrollableScreen, SectionBox, SectionTitleLabel, SmallTitle, SmallTitleLabel, TimeText, WideScreen } from "../component/basics";
import { godzilla_article, godzilla_conversation_post_comments, godzilla_conversation_posts, godzilla_conversations, godzilla_group_conversations, godzilla_groups, godzilla_related } from "../data/articles/godzilla";
import { authorRobEnnals } from "../data/authors";
import { useCollection, useDatastore, useGlobalProperty, useObject, usePersona, usePersonaKey } from "../util/datastore";
import { expandDataList, expandUrl } from "../util/util";
import { pushSubscreen } from "../util/navigate";
import { PostInput, TopCommentInput } from "../component/replyinput";
import { ActionCollapse, ActionLike, ActionReply, BasicComments, Comment, CommentContext, GuestAuthorBling, PreviewComment, PublishedBling } from "../component/comment";
import { useContext, useEffect, useState } from "react";
import { QuietSystemMessage } from "../component/message";
import { TranslatableLabel, languageFrench, useTranslation } from "../component/translation";
import { godzilla_article_french, godzilla_conversation_post_comments_french, godzilla_conversation_posts_french, godzilla_conversations_french, godzilla_groups_french } from "../translations/french/articles_french";
import { TabBar } from "../component/tabs";
import { Post, PostActionButton, PostActionComment, PostActionEdit, PostActionLike } from "../component/post";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserFace } from "../component/userface";
import { ConversationPreview, ConversationScreenInfo, GroupPromo, GroupScreenInfo, MultiChatScreen } from "../component/multichat";
import { ActionPromote } from "./OpenHouse";
import { SemiAnonymousCommentConfig } from "./SemiAnonymous";

export const SemiAnonMulti = {
    key: 'semianonmulti',
    name: 'SemiAnon Multi',
    description: "Multiple Groups can run their own conversations. These are done using semi-anonymous conversations.",
    author: authorRobEnnals,
    date: '2023-09-26',
    hasMembers: true,
    screen: MultiChatScreen,
    subscreens: {
        conversation: ConversationScreenInfo,
        group: GroupScreenInfo,
    },
    config: {
        conversationPreview: SemiAnonConversationPreview,
        conversationWidget: SemiAnonConversation,
        memberExplain: 'You can see everyone\'s names. Non members can\'t.',
        nonMemberExplain: 'Only members can see people\'s names'
    },
    instance: [
        {key: 'godzilla-article', name: 'Godzilla Article', article: godzilla_article,
            conversation: expandDataList(godzilla_conversations),
            group: expandDataList(godzilla_groups),
            comment: expandDataList(godzilla_group_conversations),
            related: expandDataList(godzilla_related)
        },
    ]
}

function SemiAnonConversationPreview({conversation, embed}) {
    const comments = useCollection('comment', {filter: {replyTo: conversation.key, article: undefined}});
    return <ConversationPreview conversation={conversation} comments={comments} embed={embed} hideNames />   
}

function SemiAnonConversation({conversation}) {
    return <BasicComments about={conversation.key} config={SemiAnonymousCommentConfig} />
}