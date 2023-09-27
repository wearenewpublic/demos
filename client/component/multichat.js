
import React from "react";
import { Image, Switch, Text, View } from "react-native";
import { MaybeArticleScreen } from "../component/article";
import { BigTitle, BodyText, Card, Center, Clickable, EditableText, HorizBox, HoverRegion, InfoBox, ListItem, MaybeEditableText, Narrow, Pad, PadBox, Pill, PluralLabel, PreviewText, ScrollableScreen, SectionBox, SectionTitleLabel, SmallTitle, SmallTitleLabel, TimeText, WideScreen } from "../component/basics";
import { godzilla_article, godzilla_conversation_post_comments, godzilla_conversation_posts, godzilla_conversations, godzilla_groups } from "../data/articles/godzilla";
import { authorRobEnnals } from "../data/authors";
import { useCollection, useDatastore, useGlobalProperty, useObject, usePersona, usePersonaKey } from "../util/datastore";
import { expandDataList, expandUrl } from "../util/util";
import { pushSubscreen } from "../util/navigate";
import { PostInput, TopCommentInput } from "../component/replyinput";
import { BasicComments, Comment, CommentContext, GuestAuthorBling, PreviewComment, PublishedBling } from "../component/comment";
import { useContext, useEffect, useState } from "react";
import { QuietSystemMessage } from "../component/message";
import { TranslatableLabel, languageFrench, useTranslation } from "../component/translation";
import { godzilla_article_french, godzilla_conversation_post_comments_french, godzilla_conversation_posts_french, godzilla_conversations_french, godzilla_groups_french } from "../translations/french/articles_french";
import { TabBar } from "../component/tabs";
import { Post, PostActionButton, PostActionComment, PostActionEdit, PostActionLike } from "../component/post";
import { FontAwesome5 } from "@expo/vector-icons";
import { UserFace } from "../component/userface";
import { PrototypeContext } from "../organizer/PrototypeContext";


export function GroupPromo({group}) {
    return <HoverRegion onPress={() => pushSubscreen('group', {groupKey:group.key})}>
        <HorizBox center>
            <Image source={{uri: group.image}} style={{width: 32, height: 32, borderRadius: 10, marginRight: 4}} />
            <View style={{flex: 1}}>
                <Text style={{fontWeight: 'bold', fontSize: 13}}>{group.name}</Text>
                <Text style={{color: '#666', fontSize: 12}}>{group.slogan}</Text>
            </View>
        </HorizBox>
    </HoverRegion>
}

export const GroupScreenInfo = {
    screen: GroupScreen,
    title: 'Group'
}

export function GroupScreen({groupKey}) {
    const persona = usePersona();
    const group = useObject('group', groupKey);
    const [tab, setTab] = useState(null);
    const conversations = useCollection('conversation', {filter: {group: groupKey}});
    const members = useCollection('persona', {filter: {member: true}});
    const {prototype} = useContext(PrototypeContext);

    const conversationPreview = prototype.config.conversationPreview;

    useEffect(() => {
        if (persona.member) {
            setTab('discussion');
        } else {
            setTab('about');
        }
    }, [persona, groupKey])


    return <ScrollableScreen>
        <HorizBox center>
            <Image source={{uri: group.image}} style={{width: 64, height: 64, borderRadius: 10, marginRight: 4}} />
            <View style={{flex: 1}}>
                {/* <Text style={{fontWeight: '600'}}>{group.name}</Text> */}
                <Text style={{fontWeight: 'bold', fontSize: 24}}>{group.name}</Text>
                <Text style={{color: '#666', fontSize: 15}}>{group.slogan}</Text>
            </View>
        </HorizBox>

        <Pad size={32} />
        <TabBar tabs={[{key: 'about', label: 'About'}, {key: 'members', label: 'Members'}, {key: 'discussion', label: 'Discussion'}]} selectedTab={tab} onSelectTab={setTab} />
        <Pad size={32} />

        {tab == 'discussion' && 
            conversations.map(conversation =>
                React.createElement(conversationPreview, {key: conversation.key, conversation: conversation})
            )
        }
        {tab == 'members' && 
            members.map(member =>
                <Card key={member.key}>
                    <HorizBox center>
                        <UserFace userId={member.key} size={40} />
                        <Pad />
                        <SmallTitle pad={false} >{member.name}</SmallTitle>
                    </HorizBox>
                </Card>
            )
        }

    </ScrollableScreen>

}

export function ConversationPreview({conversation, embed, comments, hideNames=false}) {
    const group = useObject('group', conversation.group);
    const tComments = useTranslation('posts');
    const shownComments = embed ? [] : comments.slice(0,3);
    return <Card onPress={() => pushSubscreen('conversation', {conversationKey: conversation.key})}>
        <HorizBox>
            <Image source={{uri: group.image}} style={{width: 40, height: 40, borderRadius: 10, marginRight: 8}} />
            <View style={{flex: 1}}>
                <SmallTitle>{group.name}</SmallTitle>
                <BodyText>{conversation.title}</BodyText>
                {embed && <Text style={{marginTop: 4, fontSize: 12, color: '#666'}}>{comments.length + ' ' + tComments}</Text>}
            </View>
        </HorizBox>
        {!embed && <Pad size={4} />}
        {shownComments.map(comment => 
            <PreviewComment key={comment.key} comment={comment} numberOfLines={2} hideName={hideNames} />
        )}
        {!embed && comments.length > 2 && <CallToAction><PluralLabel count={comments.length -2} singular='comment' plural='comments'/></CallToAction>}
        {!embed && comments.length <= 2 && <CallToAction><TranslatableLabel label='Join the conversation' /></CallToAction>}
    </Card>
}

function CallToAction({children}) {
    return <Text style={{fontWeight: 'bold', fontSize: 13, marginLeft: 4, marginTop: 4, textAlign: 'center'}}>
        {children}
    </Text>
}


export function MultiChatScreen() {
    const conversations = useCollection('conversation', {sortBy: 'title'});
    const {prototype} = useContext(PrototypeContext);
    const conversationPreview = prototype.config.conversationPreview;

    return <MaybeArticleScreen articleChildLabel='Conversations' embed={<ConversationListEmbed/>}>
        <Narrow>
            {conversations.map(conversation =>
                React.createElement(conversationPreview, {key: conversation.key, conversation: conversation})
            )}
        </Narrow>
    </MaybeArticleScreen>
}

function ConversationListEmbed() {
    const conversations = useCollection('conversation', {sortBy: 'title'});
    const {prototype} = useContext(PrototypeContext);
    const conversationPreview = prototype.config.conversationPreview;

    return <View>        
        {conversations.map(conversation =>
            React.createElement(conversationPreview, {key: conversation.key, conversation: conversation, embed: true})
        )}
    </View>
}


export const ConversationScreenInfo = {
    screen: ConversationScreen,
    title: 'Conversation'
}

function ConversationScreen({conversationKey}) {
    const conversation = useObject('conversation', conversationKey);
    const group = useObject('group', conversation.group);
    const persona = usePersona();
    const {prototype} = useContext(PrototypeContext);

    return <ScrollableScreen grey={prototype.config.grey} maxWidth={null} pad={false} >
        <View style={{backgroundColor: 'white'}}>
            <Narrow >
                <GroupPromo group={group} />
                <Pad size={8} />
                <BigTitle>{conversation.title}</BigTitle>
                <BodyText>{conversation.description}</BodyText>
                <Pad size={8} />
            </Narrow>
        </View>

        <Narrow>
            {persona.member && <InfoBox titleLabel='You are a member' lines={[prototype.config.memberExplain]} />}
            {!persona.member && <InfoBox titleLabel='You are a guest' lines={[prototype.config.nonMemberExplain]} />}
            <Pad size={16} />
            {React.createElement(prototype.config.conversationWidget, {conversation: conversation})}
            <Pad size={32} />
        </Narrow>
    </ScrollableScreen>
}