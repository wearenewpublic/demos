
import { Image, Switch, Text, View } from "react-native";
import { MaybeArticleScreen } from "../component/article";
import { BigTitle, BodyText, Card, Center, Clickable, EditableText, HorizBox, HoverRegion, InfoBox, ListItem, MaybeEditableText, Narrow, Pad, PadBox, Pill, PluralLabel, PreviewText, ScrollableScreen, SectionBox, SectionTitleLabel, SmallTitle, SmallTitleLabel, TimeText, WideScreen } from "../component/basics";
import { godzilla_article, godzilla_conversation_post_comments, godzilla_conversation_posts, godzilla_conversations, godzilla_group_conversations, godzilla_groups, godzilla_related } from "../data/articles/godzilla";
import { authorRobEnnals } from "../data/authors";
import { useCollection, useDatastore, useGlobalProperty, useObject, usePersona, usePersonaKey } from "../util/datastore";
import { expandDataList, expandUrl } from "../util/util";
import { pushSubscreen } from "../util/navigate";
import { PostInput, TopCommentInput } from "../component/replyinput";
import { ActionCollapse, ActionReply, BasicComments, Comment, CommentContext, GuestAuthorBling, MemberAuthorBling, PreviewComment, PublishedBling } from "../component/comment";
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

export const OpenHouseMulti = {
    key: 'openhousemulti',
    name: 'OpenHouse Multi',
    description: "Use Open House mechanics to allow multiple groups to run their own conversations.",
    author: authorRobEnnals,
    date: '2023-09-26',
    hasMembers: true,
    screen: MultiChatScreen,
    subscreens: {
        conversation: ConversationScreenInfo,
        group: GroupScreenInfo,
    },
    config: {
        conversationPreview: OpenHouseConversationPreview,
        conversationWidget: OpenHouseConversation,
        memberExplain: 'Your messages will be seen prominently, and you can promote non member posts to be prominent.',
        nonMemberExplain: 'Your messages will appear small until a member promotes them.'
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

function OpenHouseConversationPreview({conversation, embed}) {
    const comments = useCollection('comment', {filter: {replyTo: conversation.key, article: undefined}});
    const datastore = useDatastore();
    const shownComments = comments.filter(comment => !getIsDefaultCollapsed({datastore, comment}));
    return <ConversationPreview conversation={conversation} comments={shownComments} embed={embed} />   
}

function OpenHouseConversation({conversationKey}) {
    const config = {    
        actions: [ActionPromote, ActionReply, ActionReCollapse],
        authorBling: [MemberAuthorBling],
        getIsDefaultCollapsed
    }

    return <BasicComments about={conversationKey} config={config} />
}

function getIsDefaultCollapsed({datastore, comment}) {
    const fromMember = datastore.getObject('persona', comment.from)?.member;
    return !fromMember && !comment.promotedBy;
}

export function ActionReCollapse({comment, commentKey}) {
    const datastore = useDatastore();
    if (getIsDefaultCollapsed({datastore, comment})) {
        return <ActionCollapse comment={comment} commentKey={commentKey} />
    } else {
        return null;
    }
}
