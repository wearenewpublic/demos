import { Image, Switch, Text, View } from "react-native";
import { MaybeArticleScreen } from "../component/article";
import { BigTitle, BodyText, Card, Center, Clickable, EditableText, HorizBox, InfoBox, ListItem, MaybeEditableText, Narrow, Pad, PadBox, Pill, PluralLabel, PreviewText, ScrollableScreen, SectionBox, SectionTitleLabel, SmallTitle, SmallTitleLabel, TimeText, WideScreen } from "../component/basics";
import { godzilla_article } from "../data/articles/godzilla";
import { authorRobEnnals } from "../data/authors";
import { useCollection, useDatastore, useGlobalProperty, useObject, usePersona, usePersonaKey } from "../util/datastore";
import { expandDataList, expandUrl } from "../util/util";
import { pushSubscreen } from "../util/navigate";
import { PostInput, TopCommentInput } from "../component/replyinput";
import { BasicComments, Comment, CommentContext, GuestAuthorBling, PreviewComment, PublishedBling } from "../component/comment";
import { useContext, useState } from "react";
import { QuietSystemMessage } from "../component/message";
import { TranslatableLabel, languageFrench, useTranslation } from "../component/translation";
import { godzilla_article_french } from "../translations/french/articles_french";
import { TabBar } from "../component/tabs";
import { Post, PostActionButton, PostActionComment, PostActionEdit, PostActionLike } from "../component/post";
import { FontAwesome5 } from "@expo/vector-icons";

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
            conversation: expandDataList([
                {
                    key: 'sci-attack', title: 'Giant Monster Attacks', group: 'sci', 
                    description: 'Monster attacks have increased significantly in recent years. Why is this happening and what can we do about it?'
                },
                {key: 'mayor-safety', title: 'NYC Disaster Preparedness', group: 'mayor',
                    description: 'It is our responsibility to make sure New York City is robust against all plausable disaster scenarios, while being efficient with taxpayer money.'
                },
                {key: 'pro-monster', title: 'Monster Behavior Problems', group: 'pro',
                    description: 'Sometimes our monster friends make mistakes. How can we help them behave better?'
                },
                {key: 'friends', title: 'NYC Monster Attack', group: 'art',
                    description: 'A monster is attacking New York. We need to save our art.'
                },
            ]),
            group: expandDataList([
                {key: 'sci', name: 'Institute of Important Scientists', image: 'https://www.aaas.org/sites/default/files/styles/square/public/2021-03/AM21_New%20Globe%20copy.png?itok=De63Hpou', slogan: 'Science is important and so are we'},
                {key: 'mayor', name: "New York City Mayor's Office", image: 'https://media.licdn.com/dms/image/C4D0BAQHr6j_Fsv98FQ/company-logo_200_200/0/1523986359131?e=2147483647&v=beta&t=JF2YNkOErNs78xgp7KY5JFVE2HdVAfJrU68xwZKLpRA', slogan: 'We are here to help'},
                {key: 'pro', name: 'Monster Protection Society', image: 'https://img.freepik.com/premium-photo/colorful-furry-monster-with-horns-horns-its-head-generative-ai_900321-42040.jpg', slogan: 'Monsters are our friends'},
                {key: 'art', name: 'Brookly Funky Artists', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaSNAQ7aDjRIaxbKW-Aj8leH3tDJMxQ_6IRA&usqp=CAU', slogan: 'Art is life'},
            ]),
            post: expandDataList([
                {isPublic: true, article: true, from: 'b', about: 'sci-attack', article: godzilla_article},
                {isPublic: true, article: true, from: 'c', about: 'mayor-safety', article: godzilla_article},
                {isPublic: true, article: true, from: 'b', about: 'pro-monster', article: godzilla_article},
                {isPublic: true, article: true, from: 'a', about: 'friends', article: godzilla_article},


                {isPublic: true, from: 'a', about: 'sci-attack', text: 'Monster attacks have increased by 50% in the last 10 years. We need to study the monsters to understand why they are attacking us.'},
                {isPublic: true, from: 'b', about: 'mayor-safety', text: 'We need to evacuate New York City and move everyone to New Jersey. Once New York is evacuted, we can bring in the national guard and use heavy weapons against the monster'},                
                {isPublic: true, from: 'c', about: 'friends', text: "Our studio was completely eaten. All our art is in that monster's stomach."},
                {isPublic: true, from: 'c', about: 'pro-monster', text: "Giant monster attacks are the fault of humans, not monsters. We need to stop polluting the oceans and stop building nuclear power plants."},
                {preventPublic: true, from: 'a', about: 'pro-monster', text: 'I wonder if the monsters are attacking us because we are making too much noise?'},    
                {from: 'b', about: 'pro-monster', text: 'I think the monsters are attacking us because they are hungry. We need to feed them.'},    
                {key: 'dumb', from: 'f', about: 'pro-monster', text: 'I am a guest, so I might say dumb things'}
            ]),
            comment: expandDataList([
                {from: 'a', replyTo: 'dumb', text: 'That is okay. This is a friendly private space.'}
            ])
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

    return <ScrollableScreen grey maxWidth={null} pad={false} >
        <View style={{backgroundColor: 'white'}}>
            <Narrow >
                <HorizBox center>
                    <Image source={{uri: group.image}} style={{width: 32, height: 32, borderRadius: 10, marginRight: 4}} />
                    <View style={{flex: 1}}>
                        {/* <Text style={{fontWeight: '600'}}>{group.name}</Text> */}
                        <Text style={{fontWeight: 'bold', fontSize: 13}}>{group.name}</Text>
                        <Text style={{color: '#666', fontSize: 12}}>{group.slogan}</Text>
                    </View>
                </HorizBox>
                <Pad size={8} />
                <BigTitle>{conversation.title}</BigTitle>
                <BodyText>{conversation.description}</BodyText>
                <Pad size={8} />
            </Narrow>
        </View>

        <Narrow pad={false}>
            <PostInfoBox conversation={conversation} />
            <Pad size={16} />
            <ConversationPosts conversation={conversation} />
            <Pad size={32} />
        </Narrow>
    </ScrollableScreen>
}

function PostInfoBox({conversation}) {
    const personaKey = usePersonaKey();
    const persona = useObject('persona', personaKey);

    if (!persona.member) {
        return <View>
                <Pad size={16} />
                <InfoBox titleLabel='You are a guest' lines={[
                'You can only see published posts, and posts you wrote yourself.',
            ]} />
        </View>  
    } else {
        return null;
    }
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
        return <QuietSystemMessage label='Your post will only be visible to group members.' />
    } else {
        return <QuietSystemMessage label='Your post will initially be private to the group, but admins can choose to make your post public' />
    }
}

function ArticleList({conversation}) {
    return <BodyText>Articles</BodyText>
}


function GroupScreen({groupKey}) {
    return <BodyText>Not Yet</BodyText>
}

function PostScreen({postKey}) {
    const personaKey = usePersonaKey();
    const persona = useObject('persona', personaKey);
    const post = useObject('post', postKey);

    const config = {
        getIsVisible: post.from != personaKey && getIsVisible, authorBling: [GuestAuthorBling]
    }

    return <ScrollableScreen>
        <Post post={post} actions={[PostActionLike, PostActionEdit, PostActionPublish]} editWidgets={[AllowPublishToggle]}
            topBling={post.isPublic && <Pill label='Published' />} authorBling={GuestAuthorBling}
 

       />        
        {/* <Pad size={16}/>         */}
        {!persona.member && post.from != personaKey && <PadBox horiz={0}><InfoBox titleLabel='You are a guest' lines={['You can only see your comments and their replies.']} /></PadBox>}    
        {!persona.member && post.from == personaKey && <PadBox horiz={0}><InfoBox titleLabel='You wrote this post' lines={['As post author, you can see all comments about your post.']} /></PadBox>}    

        <Pad size={16} />
        <SmallTitleLabel label='Private Conversation'/>

        {persona.member && <QuietSystemMessage center={false} label='Only members and people your reply to can see your comments' /> }


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
