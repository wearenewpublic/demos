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

export const GroupMultiChatPrototype = {
    key: 'groupmulti',
    name: 'Group Multi Chat',
    description: "Multiple Groups can run their own conversations that can potentially connect to multiple articles. Each conversation is private, but members can choose to publish messages to be externally visible.",
    author: authorRobEnnals,
    date: '2023-09-13',
    hasMembers: true,
    screen: GroupMultiChatScreen,
    subscreens: {
        conversation: {screen: ConversationScreen, title: 'Conversation'},
        group: {screen: GroupScreen, title: 'Group'},
        post: {screen: PostScreen, title: 'Post'}
    },
    instance: [
        {key: 'godzilla-article', name: 'Godzilla Article', article: godzilla_article,
            conversation: expandDataList(godzilla_conversations),
            group: expandDataList(godzilla_groups),
            post: expandDataList(godzilla_conversation_posts),
            comment: expandDataList(godzilla_conversation_post_comments)
        },
        {key: 'godzilla-french', name: 'Godzilla Article (French)', article: godzilla_article_french,
            language: languageFrench,
            conversation: expandDataList(godzilla_conversations_french),
            group: expandDataList(godzilla_groups_french),
            post: expandDataList(godzilla_conversation_posts_french),
            comment: expandDataList(godzilla_conversation_post_comments_french)
        },
    ]
}

function GroupMultiChatScreen() {
    const conversations = useCollection('conversation', {sortBy: 'title'});
    return <MaybeArticleScreen articleChildLabel='Conversations' embed={<ConversationListEmbed/>}>
        <Narrow>
            {conversations.map(conversation =>
                <ConversationPreview key={conversation.key} conversation={conversation} />
            )}
        </Narrow>
    </MaybeArticleScreen>
}

function ConversationListEmbed() {
    const conversations = useCollection('conversation', {sortBy: 'title'});
    return <View>
        {conversations.map(conversation =>
            <ConversationPreview key={conversation.key} conversation={conversation} embed />
        )}
    </View>
}

function ConversationPreview({conversation, embed}) {
    const comments = useCollection('post', {filter: {about: conversation.key, isPublic: true, article: undefined}});
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
            <PreviewComment key={comment.key} comment={comment} numberOfLines={2} />
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

function ConversationScreen({conversationKey}) {
    const article = useGlobalProperty('article');
    const conversation = useObject('conversation', conversationKey);
    const group = useObject('group', conversation.group);
    const persona = usePersona();

    return <ScrollableScreen grey maxWidth={null} pad={false} >
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
            {persona.member && <InfoBox titleLabel='You are a member' lines={['You can see all posts']} />}
            {!persona.member && <InfoBox titleLabel='You are a guest' lines={['You can only see published posts, and posts you wrote yourself']} />}
            {/* <PostInfoBox conversation={conversation} /> */}
            <Pad size={16} />
            <ConversationPosts conversation={conversation} />
            <Pad size={32} />
        </Narrow>
    </ScrollableScreen>
}


function GroupPromo({group}) {
    return <HoverRegion onPress={() => pushSubscreen('group', {groupKey:group.key})}>
        <HorizBox center>
            <Image source={{uri: group.image}} style={{width: 32, height: 32, borderRadius: 10, marginRight: 4}} />
            <View style={{flex: 1}}>
                {/* <Text style={{fontWeight: '600'}}>{group.name}</Text> */}
                <Text style={{fontWeight: 'bold', fontSize: 13}}>{group.name}</Text>
                <Text style={{color: '#666', fontSize: 12}}>{group.slogan}</Text>
            </View>
        </HorizBox>
    </HoverRegion>
}



function ConversationPosts({conversation}) {
    const personaKey = usePersonaKey();
    const persona = useObject('persona', personaKey);
    const posts = useCollection('post', {filter: {about: conversation.key}, sortBy: 'time', reverse: true});

    const filteredPosts = posts.filter(post => post.isPublic || post.from == personaKey || persona.member);

    function postHandler({datastore, post}) {
        datastore.addObject('post', {...post, about: conversation.key});
    }

    return <View>
        <PostInput placeholder='What do you have to contribute?' postHandler={postHandler}
             bottomWidgets={[AllowPublishToggle, PublicPostInfo]}
        />

        {filteredPosts.map(post => 
            <Post key={post.key} post={post} 
                authorBling={GuestAuthorBling}
                onComment={() => pushSubscreen('post', {postKey: post.key})}
                getIsCommentVisible={post.from != personaKey && getIsVisible} infoLineWidget={InfoLine}
                editWidgets={[AllowPublishToggle]} numberOfLines={5} hasComments
                actions={[PostActionLike, PostActionEdit, PostActionComment, PostActionPublish]}
                topBling={post.isPublic && <Pill label='Published' />}
            />
        )}
    </View>

}

function InfoLine({post}) {
    const persona = usePersona();
    if (post.preventPublic || post.isPublic || (!persona.admin && post.from != persona.key)) {
        return <TimeText time={post.time} />
    } else {
        return <HorizBox>
            <TimeText time={post.time} />
            <Pad />
            <Text style={{fontSize: 12, color: '#999'}}>-</Text>
            <Pad />
            <TranslatableLabel label='Publishing allowed' style={{fontSize: 12, color: '#999'}} />
        </HorizBox>
    }
}



function PublicPostInfo({post}) {
    if (post.preventPublic) {
        return <QuietSystemMessage label='Your post will only be visible to group members' />
    } else {
        return <QuietSystemMessage label='Your post will initially be private to the group, but admins can choose to make your post public' />
    }
}

function GroupScreen({groupKey}) {
    const persona = usePersona();
    const group = useObject('group', groupKey);
    const [tab, setTab] = useState(null);
    const conversations = useCollection('conversation', {filter: {group: groupKey}});
    const leaders = useCollection('persona', {filter: {admin: true}});
    const members = useCollection('persona', {filter: {member: true}});

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
                <ConversationPreview key={conversation.key} conversation={conversation} />
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

function PostScreen({postKey}) {
    const personaKey = usePersonaKey();
    const persona = useObject('persona', personaKey);
    const post = useObject('post', postKey);
    // const conversation = useObject('conversation', post.about);
    // const group = useObject('group', conversation.group);

    const config = {
        getIsVisible: post.from != personaKey && getIsVisible, authorBling: [GuestAuthorBling]
    }

    return <ScrollableScreen>
        {/* <PadBox vert={0}><GroupPromo group={group} /></PadBox>
        <Pad /> */}
        <Post post={post} actions={[PostActionLike, PostActionEdit, PostActionPublish]} editWidgets={[AllowPublishToggle]}
            topBling={post.isPublic && <Pill label='Published' />} authorBling={GuestAuthorBling} infoLineWidget={InfoLine}
       />        
        {/* <Pad size={16}/>         */}
        {!persona.member && post.from != personaKey && <PadBox horiz={0}><InfoBox titleLabel='You are a guest' lines={['You can only see your comments and their replies']} /></PadBox>}    
        {persona.member && <PadBox horiz={0}><InfoBox titleLabel='You are a member' lines={['You can see all comments']} /></PadBox>}    

        {!persona.member && post.from == personaKey && <PadBox horiz={0}><InfoBox titleLabel='You wrote this post' lines={['As post author, you can see all comments about your post']} /></PadBox>}    

        <Pad size={16} />
        <SmallTitleLabel label='Private Conversation'/>

        {/* {persona.member && <QuietSystemMessage center={false} label='Only members and people your reply to can see your comments' /> } */}


        <BasicComments about={postKey} config={config} />
    </ScrollableScreen>
}


function getIsVisible({datastore, comment}) {
    const personaKey = datastore.getPersonaKey();
    const userIsMember = datastore.getObject('persona', personaKey)?.member;

    if (userIsMember) {
        return true;
    } else if (!comment) {
        return false;
    } else if (comment?.from == personaKey) {
        return true;
    } else if (comment.isPublic) {
        return true;
    } else {
        return getIsVisible({datastore, comment: datastore.getObject('comment', comment?.replyTo)});
    }
}

function AllowPublishToggle({post, onPostChanged}) {
    return <View>
        <HorizBox center>
            <Switch value={!post.preventPublic} onValueChange={value => onPostChanged({...post, preventPublic: !value})} />
            <Pad size={12} />
            <TranslatableLabel label='Allow Publication' style={{fontSize: 13, fontWeight: post.public ? null : 'bold'}}/>
        </HorizBox>
        <Pad/>
    </View>
}

export function PostActionPublish({post}) {
    const persona = usePersona();
    const datastore = useDatastore();

    if (post.preventPublic || post.isPublic || !persona.admin) {
        return null;
    }

    function onPublish() {
        datastore.updateObject('post', post.key, {isPublic: true});
    }
    return <PostActionButton iconName='award' iconSet={FontAwesome5} label='Publish' onPress={onPublish} />
}
